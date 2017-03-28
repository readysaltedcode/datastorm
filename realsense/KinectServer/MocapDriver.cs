using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace KinectServer
{
    public abstract class MocapDriver : SkeletonEventDispatcher
    {
        private int lastFrameSkeletonCount = 0;

        private List<SkeletonReceiver> listeners = new List<SkeletonReceiver>();

        /**
         * Once you have a skeleton frame in your implementation, call this!
         */
        protected void SkeletonFrameReady(ISkeletonFrame frame)
        {
            try
            {
                //Console.WriteLine("\tSkeletonFrame.FrameNumber: {0}", frame.FrameNumber);
                //newSkeletonFrame = true;
                if (frame.Skeletons.Count > lastFrameSkeletonCount)
                    Console.WriteLine("\tMore skeletons detected");
                else if (frame.Skeletons.Count < lastFrameSkeletonCount)
                    Console.WriteLine("\tFewer skeletons detected");
                lastFrameSkeletonCount = frame.Skeletons.Count;

                List<SkeletonReceiver> sickListeners = new List<SkeletonReceiver>();
                // This would be more stable if implemented using a thread pool and a queue, but for
                // a handful of clients this shouldn't be an issue;
                List<SkeletonReceiver> listenersCopy;
                lock (listeners)
                {
                    listenersCopy = listeners.ToList();
                }
                foreach (SkeletonReceiver listener in listenersCopy)
                {
                    try
                    {
                        listener.receiveFrame(frame);
                    }
                    catch
                    {
                        Console.WriteLine("A skeleton client caused an error and will no longer receive messages.");
                        sickListeners.Add(listener);
                    }
                }
                foreach (SkeletonReceiver sickListener in sickListeners)
                {
                    listeners.Remove(sickListener);
                }
            }
            catch (Exception ex) { Console.WriteLine("Failed in SkeletonFrameReady"); Console.WriteLine(ex.StackTrace); }

        }


        public void addSkeletonReceiver(SkeletonReceiver listener)
        {

            lock (listeners)
            {
                if (!listeners.Contains(listener))
                    listeners.Add(listener);
            }
        }

        public void removeSkeletonReceiver(SkeletonReceiver listener)
        {
            lock (listeners)
                listeners.Remove(listener);
        }
    }


}
