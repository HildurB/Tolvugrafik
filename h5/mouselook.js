function mouseLook( key, mdelta )
{
  var delta = vec3(0, 0, 0);

  if (key === 'w') {
      delta = vec3(0, 0, 1);  // Forwards
  } else if (key === 's') {
      delta = vec3(0, 0, -1);  // Backwards
  } else if (key === 'a') {
      delta = vec3(-1, 0, 0);  // Left
  } else if (key === 'd') {
      delta = vec3(1, 0, 0);  // Right
  }

  Uangle += mdelta;

  up = vec3(0.0, 1.0, 0.0);

    if ( equal(delta, Uangle) ) {
        return mat4();
    }

    var v = normalize( subtract(Uangle, delta) );  // view direction vector
    var n = normalize( cross(v, up) );       // perpendicular vector
    var u = normalize( cross(n, v) );        // "new" up vector

    v = negate( v );

    var result = mat4(
        vec4( n, -dot(n, delta) ),
        vec4( u, -dot(u, delta) ),
        vec4( v, -dot(v, delta) ),
        vec4()
    );

    return result;
}