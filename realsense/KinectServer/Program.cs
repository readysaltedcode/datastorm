﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Net.Sockets;
using System.Diagnostics;
using System.Net;

namespace KinectServer
{
    public class Program
    {
        public static int fps = 30;
        public static int mspf = 1000 / fps;

        public static Stopwatch stopwatch = new Stopwatch();
        private static Server server;

        static void Main(string[] args)
        {
            // TODO: make these command line switchable
            KinectDriver kinectDriver = new KinectDriver();
            //realsenseDriver = new RealsenseDriver();
            server = new Server(kinectDriver);
            server.logging = true;
            if (args.Count() == 1) Server.serverEP = args[0];

            server.StartServer(); // blocks till exit
        }

    }
}
