// src/sheep.js
// by Florian Horn Sanders

function renderScene() {
    // Base frame for sheep (no scale here)
  var bodyFrame = new Matrix4();
  bodyFrame.translate(-0.35, -0.05, -0.20);

  // ---- BODY (big white rectangle) ----
  var body = new Cube();
  body.color = [.98, .95, .95, 1.0]; // white
  body.matrix = new Matrix4(bodyFrame);
  body.matrix.scale(0.60, 0.35, 0.9);
  body.render();

  // ---- WOOL TOP (small white rectangle on top for texture) ----
  var woolTop = new Cube();
  woolTop.color = [0.9, 0.9, 0.9, 1.0];   // slightly off-white so it reads as texture
  woolTop.matrix = new Matrix4(bodyFrame);
  woolTop.matrix.translate(0.05, 0.35, 0.08);  // sits on top of body
  woolTop.matrix.scale(0.50, 0.015, 0.74);      // smaller than body
  woolTop.render();
  var wool = new Cube();
  wool.color = [0.95, 0.95, 0.95, 1.0];   // slightly off-white so it reads as texture
  wool.matrix = new Matrix4(bodyFrame);
  wool.matrix.translate(0.099, 0.35, 0.1);  // sits on top of body
  wool.matrix.scale(0.40, 0.05, 0.7);      // smaller than body
  wool.render();



  // ---- LEFT FRONT LEG (upper + lower) ----
var leftLeg = new Cube();
leftLeg.color = [0.1, 0.1, 0.1, 1.0];
leftLeg.matrix = new Matrix4(bodyFrame);
leftLeg.matrix.translate(0.10, -0.20, 0.10);
leftLeg.matrix.rotate(-g_magentaAngle, 1, 0, 0);
var leftLegMat = new Matrix4(leftLeg.matrix);     // snapshot BEFORE scaling
leftLeg.matrix.scale(0.10, 0.25, 0.10);
leftLeg.render();

var leftLowerLeg = new Cube();
leftLowerLeg.color = [0.1, 0.1, 0.1, 1.0];
leftLowerLeg.matrix = new Matrix4(leftLegMat);    // copy, don’t reuse same object
leftLowerLeg.matrix.rotate(g_lowerlegAngle, 1, 0, 0);
leftLowerLeg.matrix.translate(0.0, -0.25, 0.0);
leftLowerLeg.matrix.scale(0.10, 0.25, 0.10);
leftLowerLeg.render();


// ---- RIGHT FRONT LEG (upper + lower) ----
var rightLeg = new Cube();
rightLeg.color = [0.1, 0.1, 0.1, 1.0];
rightLeg.matrix = new Matrix4(bodyFrame);
rightLeg.matrix.translate(0.40, -0.20, 0.10);
rightLeg.matrix.rotate(g_magentaAngle, 1, 0, 0);
var rightLegMat = new Matrix4(rightLeg.matrix);
rightLeg.matrix.scale(0.10, 0.25, 0.10);
rightLeg.render();

var rightLowerLeg = new Cube();
rightLowerLeg.color = [0.1, 0.1, 0.1, 1.0];
rightLowerLeg.matrix = new Matrix4(rightLegMat);
rightLowerLeg.matrix.translate(0.0, 0.0, 0.0);
rightLowerLeg.matrix.rotate(g_lowerlegAngle, 1, 0, 0);
rightLowerLeg.matrix.translate(0.0, -0.25, 0.0);
rightLowerLeg.matrix.scale(0.10, 0.25, 0.10);
rightLowerLeg.render();


// ---- LEFT BACK LEG (upper + lower) ----
var leftLegB = new Cube();
leftLegB.color = [0.1, 0.1, 0.1, 1.0];
leftLegB.matrix = new Matrix4(bodyFrame);
leftLegB.matrix.translate(0.10, -0.20, 0.70);
leftLegB.matrix.rotate(g_magentaAngle, 1, 0, 0);
var leftLegBMat = new Matrix4(leftLegB.matrix);
leftLegB.matrix.scale(0.10, 0.25, 0.10);
leftLegB.render();

var leftLowerLegB = new Cube();
leftLowerLegB.color = [0.1, 0.1, 0.1, 1.0];
leftLowerLegB.matrix = new Matrix4(leftLegBMat);
leftLowerLegB.matrix.translate(0.0, 0.0, 0.0);
leftLowerLegB.matrix.rotate(g_lowerlegAngle, 1, 0, 0);
leftLowerLegB.matrix.translate(0.0, -0.25, 0.0);
leftLowerLegB.matrix.scale(0.10, 0.25, 0.10);
leftLowerLegB.render();


// ---- RIGHT BACK LEG (upper + lower) ----
var rightLegB = new Cube();
rightLegB.color = [0.1, 0.1, 0.1, 1.0];
rightLegB.matrix = new Matrix4(bodyFrame);
rightLegB.matrix.translate(0.40, -0.20, 0.70);
rightLegB.matrix.rotate(-g_magentaAngle, 1, 0, 0);
var rightLegBMat = new Matrix4(rightLegB.matrix);
rightLegB.matrix.scale(0.10, 0.25, 0.10);
rightLegB.render();

var rightLowerLegB = new Cube();
rightLowerLegB.color = [0.1, 0.1, 0.1, 1.0];
rightLowerLegB.matrix = new Matrix4(rightLegBMat);
rightLowerLegB.matrix.translate(0.0, 0.0, 0.0);
rightLowerLegB.matrix.rotate(g_lowerlegAngle, 1, 0, 0);
rightLowerLegB.matrix.translate(0.0, -0.25, 0.0);
rightLowerLegB.matrix.scale(0.10, 0.25, 0.10);
rightLowerLegB.render();




  // ---------- NECK + HEAD GROUP ----------
  // Everything (neck, head, muzzle, eyes) is attached to the neck.
  // Rock the neck side-to-side using g_yellowAngle.

  // Neck base pivot 
  var neckPivotX = 0.20;
  var neckPivotY = 0.10;
  var neckPivotZ = -0.12;

  // Build a group transform that rotates the whole head assembly about the neck base
  var neckGroup = new Matrix4(bodyFrame);
  neckGroup.translate(neckPivotX, neckPivotY, neckPivotZ);
  neckGroup.rotate(g_yellowAngle, 0, 0, 1);      // rock side-to-side (roll)
  neckGroup.translate(-neckPivotX, -neckPivotY, -neckPivotZ);

  // ---------- NECK ----------
  var neck = new Cube();
  neck.color = [1.0, 1.0, 1.0, 1.0];
  neck.matrix = new Matrix4(neckGroup);
  neck.matrix.translate(0.20, 0.1, -0.12);       // (unchanged)
  neck.matrix.rotate(g_yellowAngle, 1, 0, 0);    // keep if you still want extra neck pitch; remove if not desired
  neck.matrix.scale(0.20, 0.18, 0.25);
  neck.render();

  // ---------- HEAD ----------
  var head = new Cube();
  head.color = [1.0, 1.0, 1.0, 1.0];
  head.matrix = new Matrix4(neckGroup);
  head.matrix.translate(0.16, 0.1, -0.30);       
  head.matrix.scale(0.28, 0.22, 0.22);
  head.render();

  // ---------- MUZZLE / FACE ----------
  var muzzle = new Cube();
  muzzle.color = [0.05, 0.05, 0.05, 1.0];
  muzzle.matrix = new Matrix4(neckGroup);
  muzzle.matrix.translate(0.20, 0.2-.08, -0.40); 
  muzzle.matrix.scale(0.20, 0.17, 0.14);
  muzzle.render();


  // ---------- EYES ----------
  // Each eye = 2 cubes: inner (white) + outer (dark gray)
  // Left eye - inner (white)
  var leftEyeInner = new Cube();
  leftEyeInner.color = [1.0, 1.0, 1.0, 1.0];
  leftEyeInner.matrix = new Matrix4(neckGroup);
  leftEyeInner.matrix.translate(0.21, 0.30-.08, -0.405); 
  leftEyeInner.matrix.scale(0.04, 0.04, 0.04);
  leftEyeInner.render();

  // Left eye - outer (dark gray)
  var leftEyeOuter = new Cube();
  leftEyeOuter.color = [0.2, 0.2, 0.2, 1.0];
  leftEyeOuter.matrix = new Matrix4(neckGroup);
  leftEyeOuter.matrix.translate(0.24, 0.30-.08, -0.406); 
  leftEyeOuter.matrix.scale(0.04, 0.04, 0.04);
  leftEyeOuter.render();

  // Right eye - inner (white)
  var rightEyeInner = new Cube();
  rightEyeInner.color = [1.0, 1.0, 1.0, 1.0];
  rightEyeInner.matrix = new Matrix4(neckGroup);
  rightEyeInner.matrix.translate(0.35, 0.30-.08, -0.405); 
  rightEyeInner.matrix.scale(0.04, 0.04, 0.04);
  rightEyeInner.render();

  // Right eye - outer (dark gray)
  var rightEyeOuter = new Cube();
  rightEyeOuter.color = [0.2, 0.2, 0.2, 1.0];
  rightEyeOuter.matrix = new Matrix4(neckGroup);
  rightEyeOuter.matrix.translate(0.32, 0.30-.08, -0.406); 
  rightEyeOuter.matrix.scale(0.04, 0.04, 0.04);
  rightEyeOuter.render();



  // ---------- TAIL ----------
  var tail = new Cube();
  tail.color = [1.0, 1.0, 1.0, 1.0];
  tail.matrix = new Matrix4(bodyFrame);
  tail.matrix.translate(0.26, 0.15, 0.90);
  var tailMat1 = new Matrix4(tail.matrix);
  tail.matrix.scale(0.05, 0.05, 0.08);
  tail.render();
  
  var tail2 = new Cube();
  tail2.color = [1.0, 1.0, 1.0, 1.0];
  tail2.matrix = new Matrix4(tailMat1);
  tail2.matrix.translate(0.0, 0.0, 0.06);
  tail2.matrix.rotate(-20, 1, 0, 0);
  var tailMat2 = new Matrix4(tail2.matrix);  // snapshot BEFORE scaling
  tail2.matrix.scale(0.05, 0.05, 0.08);
  tail2.render();


  var tail3 = new Cube();
  tail3.color = [1.0, 1.0, 1.0, 1.0];
  tail3.matrix = new Matrix4(tailMat2);
  tail3.matrix.translate(0.0, 0.0, 0.06);
  tail3.matrix.rotate(-20, 1, 0, 0);
  tail3.matrix.scale(0.05, 0.05, 0.08);
  tail3.render();
}
