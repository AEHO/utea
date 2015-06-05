import {vec3, mat4} from "gl-matrix";

const deg_to_rad = (deg) => deg*Math.PI/180.0;

/**
 * We have a bunch of global positions that
 * defines where in space objects inhabit. The
 * camera has a position as well. But, we want to
 * see as if we were the camera. To do that we
 * need to see those global-space coordinates
 * as if they where local to the camera. We do
 * this by multiplying them by the inverse of the
 * transformation matrix that takes us to the
 * camera position.
 *
 * Remember:
 *  - Get global from local:
 *    g = T_1*...*T_N*x
 *
 *  - Get local from global:
 *    x = T^{-1}_N*...*T^{-1}_1*g
 *
 *  To get to any position/orientation of the
 *  camera we must perform 3 euler rotations and a
 *  translation. The inverse of these are pretty
 *  straigforward. So, compose the inverse and
 *  there you go!
 */
export default class Camera {
  constructor (fov=70, near=0.1, far=1000) {
    this._dirty = true;
    this._dirtyInverse = true;

    // updated by the paintboard
    this._width = 0.0;
    this._height = 0.0;

    // perspective camera parametrization
    this._fov = fov;
    this._near = near;
    this._far = far;
    this._ar = 1.0;

    // default camera positioning
    this._at = vec3.create();
    this._position = vec3.clone([0.0, 0.0, -1.0]);
    this._up = vec3.clone([0.0, 1.0, 0.0]);

    // internal matrices
    this._viewMatrix = mat4.create();
    this._projectionMatrix = mat4.create();
    this._projectionViewMatrix = mat4.create();
    this._inverseProjectionViewMatrix = mat4.create();
  }

  get position () { return this._position; }
  get at () { return this._at; }
  get up () { return this._up; }
  get ar () { return this._ar; }
  get fov () { return this._fov; }

  get projectionViewMatrix () {
    if (this._dirty) {
      this._updateProjectionViewMatrix();
      this._dirty = false;
    }

    return this._projectionViewMatrix;
  }

  get inverseProjectionViewMatrix () {
    if (this._dirty) {
      this._updateProjectionViewMatrix();
      this._dirty = false;
    }

    if (this._dirtyInverse) {
      mat4.invert(this._inverseProjectionViewMatrix,
                  this._projectionViewMatrix);
      this._dirtyInverse = false;
    }

    return this._inverseProjectionViewMatrix;
  }

  set position (value) {
    this._position = value;
    this._dirty = true;
    this._dirtyInverse = true;
  }

  set at (value) {
    this._at = value;
    this._dirty = true;
    this._dirtyInverse = true;
  }

  set up (value) {
    this._up = value;
    this._dirty = true;
    this._dirtyInverse = true;
  }

  set ar (value) {
    this._ar = value;
    this._dirty = true;
    this._dirtyInverse = true;
  }

  set fov (value) {
    this._fov = value;
    this._dirty = true;
    this._dirtyInverse = true;
  }

  incrementPosition (x, y=0.0, z=0.0) {
    this._position[0] += x;
    this._position[1] += y;
    this._position[2] += z;

    this._dirty = true;
    this._dirtyInverse = true;
  }

  _updateProjectionViewMatrix () {
    mat4.lookAt(this._viewMatrix, this._position, this._at, this._up);
    mat4.invert(this._viewMatrix, this._viewMatrix);
    mat4.perspective(this._projectionMatrix, deg_to_rad(this._fov),
      this._ar, this._near, this._far);
    mat4.multiply(this._projectionViewMatrix,
      this._projectionMatrix, this._viewMatrix);
  }

};

