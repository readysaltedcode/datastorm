/*
   Stepflash - flash on each step
   Uses the Arduino 101 board step detection to flash a neopixle ring on each step

   Copyright (c) 2016 readysaltedcode.  All rights reserved

   CurieImu.h library
   Copyright (c) 2015 Intel Corporation.  All rights reserved.

   This library is free software; you can redistribute it and/or
   modify it under the terms of the GNU Lesser General Public
   License as published by the Free Software Foundation; either
   version 2.1 of the License, or (at your option) any later version.

   This library is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
   Lesser General Public License for more details.

   You should have received a copy of the GNU Lesser General Public
   License along with this library; if not, write to the Free Software
   Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

*/

#include "CurieImu.h"
#include <Adafruit_NeoPixel.h>

/* 
 *  Uses the step notification interrupt to animate and LED ring.
 *  
 * Does not use the step counter as, by design, the step counter does not immediately update on every step detected.
 * Please refer to Section 2.7 of the BMI160 IMU SensorData Sheet
 * for more information on this feature.
*/

#define PIN 5       // pin to led ring from main board. 
#define NUMLEDS 24  // Number of LEDs in the ring 

Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUMLEDS, PIN, NEO_GRB + NEO_KHZ800);

void setup() {

  strip.begin();
  strip.setBrightness(40); //adjust brightness he
  strip.show(); // Initialize all pixels to 'off're
  
  Serial.begin(9600);
  
  // intialize the sensor:
  CurieImu.initialize();

  // turn on step detection mode:
  CurieImu.setStepDetectionMode(BMI160_STEP_MODE_NORMAL);

  CurieImu.attachInterrupt(eventCallback);   
  CurieImu.setIntStepEnabled(true);        // turn on step detection
  CurieImu.setIntEnabled(true);            // enable interrupts

}

void loop() {
// Do nothing!
}

/*
 * eventCallback() will fire everytime a step is detected.
 */

int numSteps = 0; // Step counter 
uint32_t myFavoriteColor = strip.Color(50, 0, 255);

static void eventCallback(void) {
  
  numSteps++; // Count the steps
  Serial.print(numSteps);
  Serial.println(" step(s) detected"); 

  theaterChase(myFavoriteColor, 30, 3); // Colour them in one by one 
}

//Theatre-style crawling lights.
void theaterChase(uint32_t color, uint8_t wait, uint8_t cycles) {
  for (int j=0; j<cycles; j++) {  //do cycles of chasing
    for (int q=0; q < 3; q++) {
      for (int i=0; i < strip.numPixels(); i=i+3) {
        strip.setPixelColor(i+q, color);    //turn every third pixel on
      }
      strip.show();

      delay(wait);

      for (int i=0; i < strip.numPixels(); i=i+3) {
        strip.setPixelColor(i+q, 0);        //turn every third pixel off
      }
    }
  }
}

