#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uNormalTexture; // The normal texture
uniform vec4 uLight; // Our light source information

in vec2 vTextureCoord;
in vec2 vNormalCoord;
out vec4 FragColor;

void main() {
    vec2 coord = vTextureCoord;
    vec2 normalCoord = vNormalCoord;

    vec4 color = texture(uTexture, coord);
    vec4 normalColor = texture(uNormalTexture, normalCoord);
    vec2 lightPosition = uLight.xy;

    // Discard transparent pixels  
    if (color.a < 0.01) {
        discard;
    }

    // FragColor = normalVector;

    // We calculate the direction from the light to this pixel
    // vec3 lightVector = vec3(lightPosition.x - normalCoord.x, lightPosition.y - normalCoord.y, uLight.z);
    
    // Convert normal map color from [0,1] to [-1,1] range
    vec3 normal = normalize(normalColor.rgb * 2.0 - 1.0);

    // Create light direction vector (normalize to ensure it's a unit vector)
    vec3 lightDir = normalize(vec3(uLight.xy, 1.0));

    // Calculate dot product between normal and light direction
    float lightIntensity = max(dot(normal, lightDir), 0.0);

    // Apply lighting to color
    color.rgb *= lightIntensity;

    // By "up" direction of our normal map has the value (0.5,0.5,1.0) in terms of rgb
    // So we offset by that amount
    // normalColor.x -= 0.5;
    // normalColor.y -= 0.5;

    // We normalize our vectors to compute the direction
    // vec3 normalVector = normalize(normalColor.xyz);
    // lightVector = normalize(lightVector);

    // Compute the diffuse term for the Phong equation
    // float diffuse = 1.5 * max(dot(normalVector, lightVector), 0.0);

    // Toggle light system on or off
    if(uLight.w == 0.0) {
        FragColor = color;
    } else {
        // FragColor = color * diffuse;
        FragColor = color;
    }
}