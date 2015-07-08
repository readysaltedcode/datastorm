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
    public class RealsenseDriver : MocapDriver
    {

        public static KinectSkeletonFrame skeletonFrame;
        public static bool newSkeletonFrame;
        public static int fps = 30;
        public static int mspf = 1000 / fps;
        public static Stopwatch stopwatch = new Stopwatch();
        private bool _running;

        public RealsenseDriver()
        {
            System.Threading.Thread thread = new System.Threading.Thread(init);
            thread.Start();
        }

        private void init() {
            PXCMSession session = PXCMSession.CreateInstance();
            PXCMSenseManager instance = null;
            instance = session.CreateSenseManager();

            if (instance == null)
            {
                Console.WriteLine("Failed to create a SenseManager");
                return;
            }

            PXCMCaptureManager captureManager = instance.captureManager;
                
            /* Initialise hand stuff */
            pxcmStatus status = instance.EnableHand();
            PXCMHandModule handAnalysis = instance.QueryHand();

            if (status != pxcmStatus.PXCM_STATUS_NO_ERROR || handAnalysis == null)
            {
                Console.WriteLine("Handling hands failed");
                return;
            }

            PXCMSenseManager.Handler handler = new PXCMSenseManager.Handler();
            handler.onNewSample = ReceiveSkeletonData;

            PXCMHandConfiguration handConfiguration = handAnalysis.CreateActiveConfiguration();
            PXCMHandData handData = handAnalysis.CreateOutput();

            if (handConfiguration == null)
            {
                Console.WriteLine("Failed to create hand configuration");
                return;
            }
            if (handData == null)
            {
                Console.WriteLine("Failed to create hand output");
                return;
            }

            if (handAnalysis != null && instance.Init(handler) == pxcmStatus.PXCM_STATUS_NO_ERROR)
            {


                PXCMCapture.DeviceInfo dinfo;

                PXCMCapture.Device device = instance.captureManager.device;
                if (device != null)
                {
                    device.QueryDeviceInfo(out dinfo);
                    _maxRange = device.QueryDepthSensorRange().max;

                }

                if (handConfiguration != null)
                {
                    handConfiguration.EnableAllAlerts();
                    handConfiguration.EnableSegmentationImage(true);
                    handConfiguration.DisableAllGestures();
                    
                    handConfiguration.ApplyChanges();
                    handConfiguration.Update();
                }
                
                Console.WriteLine("Streaming from Realsense");
                int frameCounter = 0;
                _running = true;
                
                while (_running)
                {

                    if (instance.AcquireFrame(true) < pxcmStatus.PXCM_STATUS_NO_ERROR)
                    {
                        break;
                    }

                    ++frameCounter;
                    handData.Update();
                    RealsenseHandSkeletonFrame frame = new RealsenseHandSkeletonFrame(handData,frameCounter, 0);
                        
                    PXCMCapture.Sample sample = instance.QueryHandSample();
                    if (sample != null && sample.depth != null)
                    {


                        if (handData != null)
                        {
                            handData.Update();
                        }

                        
                    }
                    instance.ReleaseFrame();
                    if (frame != null)
                    {
                        SkeletonFrameReady(frame);
                    }
                }
            }

            else
            {
                Console.WriteLine("Couldn't start Realsense");
            }

            Console.WriteLine("Driver exiting") ;
            // Clean Up
            if (handData != null) handData.Dispose();
            if (handConfiguration != null) handConfiguration.Dispose();
            instance.Close();
            instance.Dispose();

        }

        public static pxcmStatus ReceiveSkeletonData(Int32 mid, PXCMCapture.Sample sample)
        {
            Console.WriteLine("Got sample " + mid);
            return pxcmStatus.PXCM_STATUS_NO_ERROR;
        }


        public float _maxRange { get; set; }
    }
}
