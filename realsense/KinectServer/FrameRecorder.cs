using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace KinectServer
{
    /**
     * Records KinectDriver frames for playback later
     */
    class FrameRecorder : SkeletonReceiver
    {
        /**
         * Singleton!  Use!
         */
        private static FrameRecorder _instance;
        public static FrameRecorder getInstance()
        {
            if (_instance == null)
                _instance = new FrameRecorder();
            return _instance;

        }
        private FrameRecorder() { }

        private LinkedList<ISkeletonFrame> frames = new LinkedList<ISkeletonFrame>();

        public void receiveFrame(ISkeletonFrame frame)
        {
            lock (frames) frames.AddLast(frame);
        }

        public LinkedList<ISkeletonFrame> GetFrames()
        {
            return frames;
        }

        public void Clear()
        {
            frames.Clear();
        }
    }
}
