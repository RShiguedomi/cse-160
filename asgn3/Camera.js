class Camera {
    constructor() {
        // this.eye=new Vector(0,0,3);
        // this.at=new Vector(0,0,-100);
        // this.up=new Vector(0,1,0);
        this.eye=new Vector3([0,0,3]);
        this.at=new Vector3([0,0,-100]);
        this.up=new Vector3([0,1,0]);
    }
    
    forward() {
        // var f = this.at.subtract(this.eye);
        // f=f.divide(f.length());
        // this.at=this.at.add(f);
        // this.eye=this.eye.add(f);
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(0.2);
        this.eye.add(f);
        this.at.add(f);
    }

    back() {
        // var f = this.eye.subtract(this.at);
        // f=f.divide(f.length());
        // this.at=this.at.add(f);
        // this.eye=this.eye.add(f);
        let f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        f.mul(0.2);
        this.eye.add(f);
        this.at.add(f);
    }

    left() {
        // var f = this.eye.subtract(this.at);
        // f=f.divide(f.length());
        // var s = f.cross(this.up);
        // this.at = this.at.add(s);
        // this.eye = this.eye.add(s);
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(0.2);

        this.eye.add(s);
        this.at.add(s);
    }

    right() {
        // var f = this.at.subtract(this.eye);
        // f=f.divide(f.length());
        // var s = f.cross(this.up);
        // this.at = this.at.add(s);
        // this.eye = this.eye.add(s);
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(0.2);

        this.eye.add(s);
        this.at.add(s);
    }

    lookLeft() {
        this.rotate(5);
    }

    lookRight() {
        this.rotate(-5);
    }

    rotate(angle) {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let rotMat = new Matrix4();
        rotMat.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f2 = rotMat.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f2);
    }
}