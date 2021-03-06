uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform float u_automata_size; // The block size in pixels
uniform float u_grid_weigth;
uniform vec4 u_grid_color;
uniform bool u_grid_active;
uniform vec4 u_alive_color;
uniform vec4 u_dying_color;
uniform vec4 u_dead_color;
uniform bool u_copy_step;


int wasAlive(vec2 coord) {
  vec4 px = texture2D(
      u_texture, mod(coord / u_resolution, 1.)); // mod for toroidal surface
  return equal(px, u_alive_color) == bvec4(true, true, true, true) ? 1 : 0;
}

vec2 getBlockCentre(const in vec2 vPos) {
  vec2 pos = floor((vPos - 0.5) / u_automata_size) * u_automata_size;
  pos.x = pos.x + u_automata_size / 2.0;
  pos.y = pos.y + u_automata_size / 2.0;
  return pos;
}

bool isGridPixel(const in vec2 vPos) {
  bvec2 comparisonResult = lessThanEqual(mod(vPos - 0.5, u_automata_size),
                                         vec2(u_grid_weigth, u_grid_weigth));
  return comparisonResult != bvec2(false, false);
}

int aliveMooreNeighbors(const in vec2 coord) {
  return wasAlive(coord + vec2(-u_automata_size, -u_automata_size)) +
         wasAlive(coord + vec2(-u_automata_size, 0.)) +
         wasAlive(coord + vec2(-u_automata_size, u_automata_size)) +
         wasAlive(coord + vec2(0., -u_automata_size)) +
         wasAlive(coord + vec2(0., u_automata_size)) +
         wasAlive(coord + vec2(u_automata_size, -u_automata_size)) +
         wasAlive(coord + vec2(u_automata_size, 0.)) +
         wasAlive(coord + vec2(u_automata_size, u_automata_size));
}

/**
 dead cell becomes live (is born) if it has 3, 6, 7, or 8 live neighbors, and a
 live cell remains alive (survives) if it has 3, 4, 6, 7, or 8 live neighbors,
   **/
void main() {
         if(u_copy_step == true) {
        vec2 coord = gl_FragCoord.xy/u_resolution;
        gl_FragColor = texture2D(u_texture, coord);
       } else 
  if (!isGridPixel(gl_FragCoord.xy) || !u_grid_active) {
    vec2 coord = getBlockCentre(gl_FragCoord.xy);
    int aliveNeighbors = aliveMooreNeighbors(coord);
    if (wasAlive(coord) == 1 &&
        (aliveNeighbors == 3 || aliveNeighbors == 4 || aliveNeighbors == 6 ||
         aliveNeighbors == 7 || aliveNeighbors == 8)) {
      gl_FragColor = u_alive_color;
    } else if (wasAlive(coord) == 0 &&
               (aliveNeighbors == 3 || aliveNeighbors == 6 ||
                aliveNeighbors == 7 || aliveNeighbors == 8)) {
      gl_FragColor = u_alive_color;
    } else {
      gl_FragColor = u_dead_color;
    }
  } else {
    gl_FragColor = u_grid_color;
  }
}