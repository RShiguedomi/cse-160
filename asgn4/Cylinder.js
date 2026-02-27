class Cylinder {
  constructor(segments = 16) {
    this.type = 'cylinder';
    this.color = [1,1,1,1];
    this.matrix = new Matrix4();
    this.segments = segments;
  }

  render() {
    var rgba = this.color;

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let step = 2 * Math.PI / this.segments;

    for (let i = 0; i < this.segments; i++) {
      let a1 = i * step;
      let a2 = (i + 1) * step;

      let x1 = Math.cos(a1) * 0.5;
      let z1 = Math.sin(a1) * 0.5;
      let x2 = Math.cos(a2) * 0.5;
      let z2 = Math.sin(a2) * 0.5;
    
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Top cap
      drawTriangle3D([0, 1, 0,  x1, 1, z1,  x2, 1, z2]);
      // Bottom cap
      drawTriangle3D([0, 0, 0,  x2, 0, z2,  x1, 0, z1]);

      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
      // Side wall (two triangles)
      drawTriangle3D([x1, 0, z1,  x2, 0, z2,  x2, 1, z2]);
      drawTriangle3D([x1, 0, z1,  x2, 1, z2,  x1, 1, z1]);
    }
  }
}
