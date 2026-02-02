#version 300 es

in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 vNormalCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
uniform vec4 uFrame;

vec4 filterVertexPosition( void ) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void ) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

vec2 filterNormalCoord( void ) {
    return aPosition * uFrame.zw + uFrame.xy;
}

void main( void ) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vNormalCoord = filterNormalCoord();
}