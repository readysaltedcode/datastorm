"use strict";
var arrastre = arrastre || {};

arrastre.util = (function(){
  var my = {};

  my.getDataOfSkeleton = function(json, skeleton) {
    // Returns flat array of x, y & z positions
    var data = [];
    if(json.Skeletons === undefined)
      return;
    if(skeleton > json.Skeletons.length - 1)
      return;
    _.each(json.Skeletons[skeleton].Joints, function(joint) {
      var pos = joint.Position;
      data.push(pos.X);
      data.push(pos.Y);
      data.push(pos.Z);
    });
    return data;
  }

  my.getTrianglesOfSkeleton = function(json, skeleton) {
    // Return array of triangles of single skeleton

    // First construct lookup for joints
    var joints = {};
    _.each(json.Skeletons[skeleton].Joints, function(j) {
      joints[j.JointType] = j.Position;
    });

    var trianglePoints_kinect = [
      // ['ShoulderCenter', 'ShoulderLeft', 'ShoulderRight'],
      ['ShoulderLeft', 'ShoulderRight', 'Spine'],
      ['HipCenter', 'HipLeft', 'HipRight'],
      ['KneeLeft', 'AnkleLeft', 'FootLeft'],
      ['KneeRight', 'AnkleRight', 'FootRight'],
      ['HandLeft', 'WristLeft', 'ElbowLeft'],
      ['HandRight', 'WristRight', 'ElbowRight'],
      ['HipLeft', 'HipRight', 'KneeLeft'],
      ['HipLeft', 'HipRight', 'KneeRight'],
      ['ShoulderCenter', 'ShoulderLeft', 'ElbowLeft'],
      ['ShoulderCenter', 'ShoulderRight', 'ElbowRight']
    ];
    var trianglePoints_realsense = [
      ['JOINT_WRIST','JOINT_THUMB_BASE','JOINT_THUMB_JT1'],
      ['JOINT_THUMB_BASE','JOINT_THUMB_JT1','JOINT_THUMB_JT2'],
      ['JOINT_THUMB_JT1','JOINT_THUMB_JT2','JOINT_THUMB_TIP'],
      ['JOINT_WRIST','JOINT_CENTER','JOINT_INDEX_BASE'],
      ['JOINT_CENTER','JOINT_INDEX_BASE','JOINT_INDEX_JT1'],
      ['JOINT_INDEX_BASE','JOINT_INDEX_JT1','JOINT_INDEX_JT2'],
      ['JOINT_INDEX_JT1','JOINT_INDEX_JT2','JOINT_INDEX_TIP'],
      ['JOINT_WRIST','JOINT_CENTER','JOINT_MIDDLE_BASE'],
      ['JOINT_CENTER','JOINT_MIDDLE_BASE','JOINT_MIDDLE_JT1'],
      ['JOINT_MIDDLE_BASE','JOINT_MIDDLE_JT1','JOINT_MIDDLE_JT2'],
      ['JOINT_MIDDLE_JT1','JOINT_MIDDLE_JT2','JOINT_MIDDLE_TIP'],
      ['JOINT_WRIST','JOINT_CENTER','JOINT_RING_BASE'],
      ['JOINT_RING_BASE','JOINT_RING_JT1','JOINT_RING_JT2'],
      ['JOINT_RING_JT1','JOINT_RING_JT2','JOINT_RING_TIP'],
      ['JOINT_WRIST','JOINT_CENTER','JOINT_PINKY_BASE'],
      ['JOINT_PINKY_BASE','JOINT_PINKY_JT1','JOINT_PINKY_JT2'],
      ['JOINT_PINKY_JT1','JOINT_PINKY_JT2','JOINT_PINKY_TIP']
      
    ];

    var trianglePoints = trianglePoints_realsense;
    
    var triangles = _.map(trianglePoints, function(points) {
      var coords = _.map(points, function(p) {
        return joints[p];
      });
      return coords;
    });
    // console.log(triangles);
    return triangles;
  }

  return my;
}());