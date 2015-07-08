using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Kinect;
using System.Collections;
using System.Web.Script.Serialization;
using System.Collections.ObjectModel;

namespace KinectServer
{
    public class Point
    {
        public float x, y, z;

        public Point(PXCMPoint3DF32 realsensePoint)
        {
            this.x = realsensePoint.x;
            this.y = realsensePoint.y;
            this.z = realsensePoint.z;
        }

        public Point(CameraSpacePoint kinectPoint)
        {
            this.x = kinectPoint.X;
            this.y = kinectPoint.Y;
            this.z = kinectPoint.Z;
        }

        public Point() { }

        public Dictionary<String, float> Position
        {
            get
            {
                Dictionary<String, float> result = new Dictionary<String, float>();
                result["X"] = this.x;
                result["Y"] = this.y;
                result["Z"] = this.z;
                return result;
            }
        }
    }

    /**
     * Genevieve-Joints, because regular Joint was taken
     */
    public class GJoint : Point
    {
        private PXCMHandData.JointType _jointType;
        public GJoint(Joint sp)
            : base(sp.Position)
        {
        }
        public GJoint(PXCMHandData.JointData sp, PXCMHandData.JointType jt)
            : base(sp.positionWorld)
        {
            _jointType = jt;
        }
        public PXCMHandData.JointType JointType
        {
            get
            {
                return _jointType;
            }
        }
    }

    public interface ISkeletonFrame
    {
        Int64 TimeStamp { get; }
        int FrameNumber { get; }
        String toJSON();
        ISkeletonCollection Skeletons { get; }
    }

    public interface ISkeletonCollection : IEnumerable
    {
        int Count { get; }
        ISkeletonData this[int index] { get; }
        new IEnumerator GetEnumerator();
    }

    public interface ISkeletonData
    {
        //SkeletonTrackingState TrackingState { get; }
        Boolean Trackable { get; }
        int TrackingID { get; }
        //SkeletonPoint Position { get; }
        IJointsCollection Joints { get; }
    }

    public interface IJointsCollection : IEnumerable
    {
        int Count { get; }
        //ISkeletonData this[int index] { get; }
        new IEnumerator GetEnumerator();
    }

    public abstract class SequencedSkeletonFrame : ISkeletonFrame
    {
        private int _FrameNumber;
        private Int64 _TimeStamp;
        public SequencedSkeletonFrame() { }
        public SequencedSkeletonFrame(int FrameNumber, Int64 TimeStamp)
        {
            this._FrameNumber = FrameNumber;
            this._TimeStamp = TimeStamp;
        }
        public abstract ISkeletonCollection Skeletons { get ;}
        public abstract String toJSON();

        public virtual Int64 TimeStamp { get { return this._TimeStamp; } }
        public virtual int FrameNumber { get { return this._FrameNumber; } }
    }

    public class KinectSkeletonFrame : SequencedSkeletonFrame
    {
        public KinectSkeletonFrame(BodyFrame frame, int FrameNumber, Int64 TimeStamp) 
        :base(FrameNumber,TimeStamp) { 
            _frame = frame; 
        }

        public KinectSkeletonFrame(int FrameNumber, Int64 TimeStamp)
            :base(FrameNumber, TimeStamp)
        {
        }

        //public SkeletonFrameQuality Quality { get { return _frame.Quality; } }
        //public Tuple<float,float,float,float> FloorClipPlane { get { return _frame.FloorClipPlane; } }
        //public Vector NormalToGravity { get { return _frame.NormalToGravity; } }
        // only returns the skeletons that are being tracked, because otherwise we generate a lot of junk data
        override public ISkeletonCollection Skeletons { get {
            Body[] skeletonDump = new Body[_frame.BodyCount];
            _frame.GetAndRefreshBodyData(skeletonDump);
            ArrayList trimmedSkeletons = new ArrayList();
            foreach (Body trimmableSkeleton in skeletonDump)
            {
                if (trimmableSkeleton.IsTracked) trimmedSkeletons.Add(trimmableSkeleton);
            }
            return new KinectSkeletonCollection(trimmedSkeletons.ToArray(typeof(Body)) as Body[]); } }
        private BodyFrame _frame;

        private int _FrameNumber;
        private Int64 _TimeStamp;

        private class JointConverter : JavaScriptConverter
        {
            public override IEnumerable<Type> SupportedTypes
            {
                get { return new ReadOnlyCollection<Type>(new List<Type>(new Type[] { typeof(Microsoft.Kinect.Joint) })); }
            }
            public override IDictionary<string, object> Serialize(object obj, JavaScriptSerializer serializer)
            {
                if (obj == null || obj.GetType() != typeof(Joint))
                    return new Dictionary<string, object>();

                Joint joint = (Joint) obj;

                if (joint != null)
                {
                    // Create the representation.
                    Dictionary<string, object> result = new Dictionary<string, object>();
                    result.Add("Position", joint.Position);
                    result.Add("TrackingState", joint.TrackingState);
                    result.Add("JointType", joint.JointType.ToString());
                    return result;
                }
                return new Dictionary<string, object>();
            }

            public override object Deserialize(IDictionary<string, object> dictionary, Type type, JavaScriptSerializer serializer)
            {
                throw new NotImplementedException();
            }
        }

        override public String toJSON()
        {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            JointConverter jc = new JointConverter();
            serializer.RegisterConverters(new JavaScriptConverter[] { jc });
            String result = serializer.Serialize(this);
            return result;
        }

        private class KinectSkeletonCollection : ISkeletonCollection
        {
            public KinectSkeletonCollection(Body[] skeletons)
            {
                _skeletons = new KinectSkeletonData[skeletons.GetLength(0)];
                int i = 0;
                foreach (Body skeleton in skeletons)
                {
                    _skeletons[i++] = new KinectSkeletonData(skeleton);
                }
            }
            public int Count { get { return _skeletons.GetLength(0); } }
            public ISkeletonData this[int i] { get { return _skeletons[i]; } }
            public IEnumerator GetEnumerator() { return _skeletons.GetEnumerator(); }
            private KinectSkeletonData[] _skeletons;

            private class KinectSkeletonData : ISkeletonData
            {
                public KinectSkeletonData(Body data) { _data = data; }
                public Boolean Trackable { get { return (_data.IsTracked ); } }
                public int TrackingID { get { return (int) _data.TrackingId; } }
                //public int EnrollmentIndex { get { return _data.EnrollmentIndex; } }
                //public int UserIndex { get { return _data.UserIndex; } }
                //public Point Position { get { return new Point(_data.); } }
                public IJointsCollection Joints { get { return new KinectJointsCollection(_data.Joints); } }
                //public SkeletonQuality Quality { get { return _data.Quality; } }
                private Body _data;

                private class KinectJointsCollection : IJointsCollection
                {
                    public KinectJointsCollection(IReadOnlyDictionary<JointType,Joint> joints) { _joints = joints; }
                    public int Count { get { return _joints.Count; } }
                    public GJoint this[JointType i] { get { return new GJoint(_joints[i]); } }
                    public IEnumerator GetEnumerator() { return _joints.GetEnumerator(); }
                    private IReadOnlyDictionary<JointType, Joint> _joints;
                }
            }
        }

        private static bool logging = false;
        internal byte[] ToBytes()
        //internal IList<ArraySegment<byte>> ToBytes()
        {
            List<byte> list = new List<byte>();
            list.AddRange(BitConverter.GetBytes(Int32.MaxValue)); // for the length to be set

            byte[] frameNumber = BitConverter.GetBytes((Int64)this.FrameNumber);
            list.AddRange(frameNumber);
            if (logging) Console.WriteLine("*Frame Number: {0}", BitConverter.ToInt64(frameNumber, 0));
            byte[] timeStamp = BitConverter.GetBytes(this.TimeStamp);
            list.AddRange(timeStamp);
            if (logging) Console.WriteLine("*TimeStamp: {0}", BitConverter.ToInt64(timeStamp, 0));

            if (this._frame != null)
            {
                foreach (ISkeletonData skel in this.Skeletons)
                {
                    if (skel.Trackable)
                    {
                        foreach (Joint joint in skel.Joints)
                        {
                            // translation
                            list.AddRange(BitConverter.GetBytes((double)(joint.Position.X)));
                            list.AddRange(BitConverter.GetBytes((double)(joint.Position.Y)));
                            list.AddRange(BitConverter.GetBytes((double)(joint.Position.Z)));

                            ////rotation
                            //list.AddRange(BitConverter.GetBytes((double)(0)));
                            //list.AddRange(BitConverter.GetBytes((double)(0)));
                            //list.AddRange(BitConverter.GetBytes((double)(0)));
                        }
                    }
                }
            }

//            return (IList<ArraySegment<byte>>)list;
            byte[] retVal = list.ToArray<byte>();
            BitConverter.GetBytes(list.Count).CopyTo(retVal, 0); // add the size
            return retVal;
        }
    }

    public class RealsenseHandSkeletonFrame : SequencedSkeletonFrame
    {
        private PXCMHandData _frame;
        public RealsenseHandSkeletonFrame(PXCMHandData frame, int FrameNumber, int Timestamp)
            :base(FrameNumber, Timestamp)
        { _frame = frame; }

        public RealsenseHandSkeletonFrame(int FrameNumber, Int64 TimeStamp)
            : base(FrameNumber, TimeStamp)
        {
        }

        override public ISkeletonCollection Skeletons
        {
            get
            {
                int numHands = _frame.QueryNumberOfHands();
                PXCMHandData.IHand[] hands = new PXCMHandData.IHand[numHands];
                for (int i = 0; i < numHands; ++i)
                {
                    _frame.QueryHandData(PXCMHandData.AccessOrderType.ACCESS_ORDER_BY_ID, i, out hands[i]);
                }
                return new RealsenseSkeletonCollection(hands);
            }
        }

        private class JointConverter : JavaScriptConverter
        {
            public override IEnumerable<Type> SupportedTypes
            {
                get { return new ReadOnlyCollection<Type>(new List<Type>(new Type[] { typeof(GJoint) })); }
            }
            public override IDictionary<string, object> Serialize(object obj, JavaScriptSerializer serializer)
            {
                if (obj == null)
                    return new Dictionary<string, object>();


                if (obj.GetType() == typeof(GJoint))
                {

                    GJoint joint = (GJoint)obj;

                    // Create the representation.
                    Dictionary<string, object> result = new Dictionary<string, object>();
                    result.Add("Position", joint.Position);
                    result.Add("JointType", joint.JointType.ToString());
                    return result;
                }
                return new Dictionary<string, object>();
            }

            public override object Deserialize(IDictionary<string, object> dictionary, Type type, JavaScriptSerializer serializer)
            {
                throw new NotImplementedException();
            }
        }

        override public String toJSON()
        {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            JointConverter jc = new JointConverter();
            serializer.RegisterConverters(new JavaScriptConverter[] { jc });
            String result = serializer.Serialize(this);
            return result;
        }

        private class RealsenseSkeletonCollection : ISkeletonCollection
        {
            private RealsenseSkeletonData[] _skeletons;

            public RealsenseSkeletonCollection(PXCMHandData.IHand[] hands)
            {
                _skeletons = new RealsenseSkeletonData[hands.GetLength(0)];
                int i = 0;
                foreach (PXCMHandData.IHand skeleton in hands)
                {
                    _skeletons[i++] = new RealsenseSkeletonData(skeleton);
                }
            }
            public int Count { get { return _skeletons.GetLength(0); } }
            public ISkeletonData this[int i] { get { return _skeletons[(int)i]; } }
            public IEnumerator GetEnumerator() { return _skeletons.GetEnumerator(); }

            private class RealsenseSkeletonData : ISkeletonData
            {
                PXCMHandData.IHand _data;

                public RealsenseSkeletonData(PXCMHandData.IHand data) { _data = data; }

                public Boolean Trackable {
                    get
                    {
                        PXCMHandData.TrackingStatusType status = (PXCMHandData.TrackingStatusType) _data.QueryTrackingStatus() ;
                        return (
                            status != PXCMHandData.TrackingStatusType.TRACKING_STATUS_OUT_OF_FOV &&
                            status != PXCMHandData.TrackingStatusType.TRACKING_STATUS_OUT_OF_RANGE);
                    }
                }

                public int TrackingID
                {
                    get
                    {
                        return _data.QueryUniqueId();
                    }
                }
                public Point Position { get { return new Point(_data.QueryMassCenterWorld()); } }
                public IJointsCollection Joints { get { return new RealsenseJointsCollection(_data); } }
                private class RealsenseJointsCollection : IJointsCollection
                {
                    Dictionary<PXCMHandData.JointType, GJoint> _joints;
                    public RealsenseJointsCollection(PXCMHandData.IHand hand) 
                    {
                        _joints = new Dictionary<PXCMHandData.JointType, GJoint>();
                        for (int j = 0; j < 0x20; j++)
                        {
                            PXCMHandData.JointType jointType = (PXCMHandData.JointType) j;
                            PXCMHandData.JointData jointData;
                            hand.QueryTrackedJoint(jointType, out jointData);
                            _joints[jointType] = new GJoint(jointData, jointType);
                        } // end iterating over joints
                    }
                    public int Count { get { return _joints.Count; } }
                    public GJoint this[PXCMHandData.JointType i] { get { return _joints[i]; } }
                    public IEnumerator GetEnumerator() { return _joints.Values.GetEnumerator(); }
                }
            }
        }
    }
}
