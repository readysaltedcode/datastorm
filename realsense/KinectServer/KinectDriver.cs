using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Kinect;
using System.Threading;
using System.Net.Sockets;
using System.Diagnostics;
using System.Net;

namespace KinectServer
{
    public class KinectDriver : MocapDriver
    {

        public KinectSensor nui;
        //public bool running = true;
        public static KinectSkeletonFrame skeletonFrame;
        public static bool newSkeletonFrame;
        public static int fps = 30;
        public static int mspf = 1000 / fps;
        public static Stopwatch stopwatch = new Stopwatch();
        private List<SkeletonReceiver> listeners = new List<SkeletonReceiver>();

        public KinectDriver()
        {
            System.Threading.Thread thread = new System.Threading.Thread(init);
            thread.Start();
        }

        private void init()
        {
            nui = KinectSensor.GetDefault();
            try
            {
                nui.Open();
            }
            catch (Exception e)
            {
                Console.WriteLine("Failed to initialise Kinect");
                return;
            }
            /*
            try
            {
                Thread.Sleep(300);
                nui.ElevationAngle = -1;
                Thread.Sleep(1000);
                nui.ElevationAngle = 1;
                Thread.Sleep(1000);
                nui.ElevationAngle = 10;
                Thread.Sleep(300);
            }
            catch (Exception e) { 
                Console.WriteLine("Failed to change elevation.\n{0}", e.Message);
                throw new Exception("Error initializing kinect");
            }
            try
            {
                nui.SkeletonStream.Enable();
            }
            catch {
                Console.WriteLine("Failed to open skeleton stream"); 
            }
            

            try
            {
                nui.DepthStream.Enable(DepthImageFormat.Resolution320x240Fps30);
            }
            catch { Console.WriteLine("Failed to open depth stream"); }

            try
            {
                nui.DepthFrameReady += new EventHandler<DepthImageFrameReadyEventArgs>(nui_DepthFrameReady);
            }
            catch { Console.WriteLine("Failed to add skeleton stream frame ready event handler"); }
            
            try
            {
                nui.SkeletonFrameReady += new EventHandler<SkeletonFrameReadyEventArgs>(nui_SkeletonFrameReady);
            }
            catch { Console.WriteLine("Failed to add skeleton stream frame ready event handler"); }*/
            bool running = true;
            BodyFrameReader bodyReader = nui.BodyFrameSource.OpenReader();
            while (running)
            {
                BodyFrame frame = bodyReader.AcquireLatestFrame();
                if (frame != null)
                {
                    SkeletonFrameReady(new KinectSkeletonFrame(frame, 0, 0));

                    frame.Dispose();
                }
            }
        }
    }
}
