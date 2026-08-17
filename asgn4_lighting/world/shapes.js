// file: src/blockyanimal.js
// Defines Point, Triangle, Circle. Uses global WebGL vars: gl, a_Position, u_FragColor, u_Size.


class Square {
  constructor(position, color, size) {
    this.position = position;
    this.color = color;
    this.size = size;
    this.type = "square";
  }

  render() {
    // Critical: triangles/circles enable the attribute array; points use a constant attribute.
    gl.disableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(u_Size, this.size);

    gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}


class Sphere {
  constructor() {
    //this.position = position; // [x,y]
    this.color = [1.0,1.0,1.0,1.0];       // [r,g,b,a]
    //this.size = size;         // pixels
    //this.segments = segments; // int
    this.type = "sphere";
    this.matrix = new Matrix4();
    this.textureNum=-2;
    this.verts32= new Float32Array([]);
  }

  render() {
    var rbga = this.color;
    
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rbga[0], rbga[1], rbga[2], rbga[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var d=Math.PI/10;
    var dd=Math.PI/10;
    
    for (var t=0; t<Math.PI; t+=d) {
      for (var r=0;r<(2*Math.PI);r+=d) {
        var p1 = [Math.sin(t)*Math.cos(r),Math.sin(t)*Math.sin(r),Math.cos(t)];

        var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r),Math.cos(t+dd)];
        var p3 =[Math.sin(t)*Math.cos(r+dd),Math.sin(t)*Math.sin(r+dd),Math.cos(t)];
        var p4 =[Math.sin(t+dd)*Math.cos(r+dd),Math.sin(t+dd)*Math.sin(r+dd),Math.cos(t+dd)];

        var uv1 = [t/Math.PI, r/(2*Math.PI)];
        var uv2 = [(t+dd)/Math.PI,r/(2*Math.PI)];
        var uv3 = [t/Math.PI,(r+dd)/(2*Math.PI)];
        var uv4 = [(t+dd)/Math.PI,(r+dd)/(2*Math.PI)];

        var v =[];
        var uv =[];
        v=v.concat(p1);uv=uv.concat(uv1);
        v=v.concat(p2);uv=uv.concat(uv2);
        v=v.concat(p4);uv=uv.concat(uv4);

        gl.uniform4f(u_FragColor, 1,1,1,1);
        drawTriangle3DUVNormal(v,uv,v);

        v=[];uv=[];
        v=v.concat(p1);uv=uv.concat(uv1);
        v=v.concat(p4);uv=uv.concat(uv4);
        v=v.concat(p3);uv=uv.concat(uv3);
        gl.uniform4f(u_FragColor, 1,0,0,1);
        drawTriangle3DUVNormal(v,uv,v);
      }
    }
  }

}

function drawTriangle(vertices) {
  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create buffer");
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

class Triangle {
  constructor(position, color, size) {
    this.position = position; // [x,y]
    this.color = color;       // [r,g,b,a]
    this.size = size;         // pixels
    this.type = "triangle";
  }

  render() {
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

    const d = this.size / 200.0; // 400px canvas => half is 200
    const x = this.position[0];
    const y = this.position[1];

    drawTriangle([
      x,     y + d,
      x - d, y - d,
      x + d, y - d,
    ]);
  }
}

class Circle {
  constructor(position, color, size, segments) {
    this.position = position; // [x,y]
    this.color = color;       // [r,g,b,a]
    this.size = size;         // pixels
    this.segments = segments; // int
    this.type = "circle";
  }

  render() {
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

    const x = this.position[0];
    const y = this.position[1];
    const r = this.size / 200.0;
    const n = Math.max(3, this.segments | 0);

    const verts = [];
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2;
      const a2 = ((i + 1) / n) * Math.PI * 2;

      const x1 = x + Math.cos(a1) * r;
      const y1 = y + Math.sin(a1) * r;
      const x2 = x + Math.cos(a2) * r;
      const y2 = y + Math.sin(a2) * r;

      verts.push(x, y, x1, y1, x2, y2);
    }

    const buf = gl.createBuffer();
    if (!buf) {
      console.log("Failed to create buffer");
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n * 3);
  }
}

// cube class ASGN2
class Cube {
  constructor() {
    //this.position = position; // [x,y]
    this.color = [1.0,1.0,1.0,1.0];       // [r,g,b,a]
    //this.size = size;         // pixels
    //this.segments = segments; // int
    this.type = "cube";
    this.matrix = new Matrix4();
    this.textureNum=-2;
  }

  render() {
    var rbga = this.color;
    
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rbga[0], rbga[1], rbga[2], rbga[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //Front (z = 0) 
    //drawTriangle3D([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0]);
    //drawTriangle3D([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0]); 

    // world asgn3  front of cube
    //drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
    //drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

    // asgn4 front of cube 
    drawTriangle3DUVNormal(
      [0,0,0, 1,1,0, 1,0,0],
      [0,0, 1,1, 1,0],
      [0,0,-1, 0,0,-1, 0,0,-1]
    );
    drawTriangle3DUVNormal(
      [0,0,0, 0,1,0, 1,1,0],
      [0,0, 0,1, 1,1],
      [0,0,-1, 0,0,-1, 0,0,-1]
    );

    gl.uniform4f(u_FragColor,  rbga[0]*.9, rbga[1]*.9, rbga[2]*.9, rbga[3]);

    //Top (y = 1)
    drawTriangle3DUVNormal([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);
    drawTriangle3DUVNormal([0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);

    gl.uniform4f(u_FragColor, rbga[0], rbga[1], rbga[2], rbga[3]);
   
    //Right (x = 1)
    drawTriangle3DUVNormal([1,1,0,  1,1,1,  1,0,0], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
    drawTriangle3DUVNormal([1,0,0,  1,1,1,  1,0,1], [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);
    gl.uniform4f(u_FragColor,  rbga[0]*.6, rbga[1]*.6, rbga[2]*.6, rbga[3]);

    // Left (x = 0)
    drawTriangle3DUVNormal([0,1,0,  0,1,1,  0,0,0], [0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]);
    drawTriangle3DUVNormal([0,0,0,  0,1,1,  0,0,1], [0,0, 1,1, 1,0], [-1,0,0, -1,0,0, -1,0,0]);
    gl.uniform4f(u_FragColor,  rbga[0]*.7, rbga[1]*.7, rbga[2]*.7, rbga[3]);
    
    //Bottom (y = 0)
    drawTriangle3DUVNormal([0,0,0,  0,0,1,  1,0,1], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
    drawTriangle3DUVNormal([0,0,0,  1,0,1,  1,0,0], [0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);

     //Back (z = 1)
    drawTriangle3DUVNormal([0,0,1,  1,1,1,  1,0,1], [0,0, 0,1, 1,1],[0,0,1, 0,0,1, 0,0,1]);
    drawTriangle3DUVNormal([0,0,1,  0,1,1,  1,1,1], [0,0, 1,1, 1,0],[0,0,1, 0,0,1, 0,0,1]);
    gl.uniform4f(u_FragColor,  rbga[0]*.8, rbga[1]*.8, rbga[2]*.8, rbga[3]);
  }

  renderfast() {
    var rbga = this.color;
    //gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rbga[0], rbga[1], rbga[2], rbga[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var allverts = [];
    //front
    allverts=allverts.concat([0,0,0, 1,1,0, 1,0,0]);
    allverts=allverts.concat([0,0,0, 0,1,0, 1,1,0]);

    //gl.uniform4f(u_FragColor,  rbga[0]*.9, rbga[1]*.9, rbga[2]*.9, rbga[3]);

    //Top (y = 1)
    allverts=allverts.concat([0,1,0,  0,1,1,  1,1,1]);
    allverts=allverts.concat([0,1,0,  1,1,1,  1,1,0]);

    //Back (z = 1)
    allverts=allverts.concat([0,0,1,  1,1,1,  1,0,1]);
    allverts=allverts.concat([0,0,1,  0,1,1,  1,1,1]);

    // Left (x = 0)
    allverts=allverts.concat([0,1,0,  0,1,1,  0,0,0]);
    allverts=allverts.concat([0,0,0,  0,1,1,  0,0,1]);

    //Right (x = 1)
    allverts=allverts.concat([1,1,0,  1,1,1,  1,0,0]);
    allverts=allverts.concat([1,0,0,  1,1,1,  1,0,1]);
    //Bottom (y = 0)
    allverts=allverts.concat([0,0,0,  0,0,1,  1,0,1]);
    allverts=allverts.concat([0,0,0,  1,0,1,  1,0,0]);
    drawTriangle3D(allverts);
  }

}

function drawTriangle3DUVNormal(vertices, uv, normals) {

  const vertexBuffer = gl.createBuffer();
  var n = 3; //vertices
  if (!vertexBuffer) {
    console.log("Failed to create buffer");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // continue for asgn3 world
  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('failed to create uv buffer object');
    return -1
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_UV,2,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(a_UV);

  var normalBuffer = gl.createBuffer();
  if (!normalBuffer) {
    console.log("failed to create normal buffer");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  //g_vertexBuffer=null;
}



function drawVertsAsTriangles(verts) {
  const buf = gl.createBuffer();
  if (!buf) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
}

// FOR ASGN2

function drawTriangle3D(vertices) {
  const vertexBuffer = gl.createBuffer();
  var n = vertices.length/3; //vertices
  //var n = 3 // verticis
  if (!vertexBuffer) {
    console.log("Failed to create buffer");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
  const vertexBuffer = gl.createBuffer();
  var n = 3; //vertices
  if (!vertexBuffer) {
    console.log("Failed to create buffer");
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // continue for asgn3 world
  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('failed to create uv buffer object');
    return -1
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_UV,2,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}
