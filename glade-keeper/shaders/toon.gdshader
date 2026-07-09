// Cel / toon shader — banded diffuse + soft rim, for the Ni no Kuni look.
// Applied at runtime by emberglade.gd's _apply_toon_shading() to every solid,
// non-emissive, non-transparent material in the world.
shader_type spatial;
render_mode cull_back, specular_disabled;

uniform vec4 albedo : source_color = vec4(1.0);
// Number of light bands (2-4 reads cleanly; higher = softer).
uniform int bands = 3;
// Ambient floor so shadowed bands aren't pure black.
uniform float shadow_floor : hint_range(0.0, 1.0) = 0.35;
// Cool edge light for silhouette separation against dark foliage.
uniform float rim_amount : hint_range(0.0, 1.0) = 0.35;
uniform vec4 rim_color : source_color = vec4(0.6, 0.72, 1.0, 1.0);

void fragment() {
	ALBEDO = albedo.rgb;
	ROUGHNESS = 1.0;
}

void light() {
	// Hard-banded diffuse term.
	float ndotl = clamp(dot(NORMAL, LIGHT), 0.0, 1.0);
	float banded = floor(ndotl * float(bands) + 0.5) / float(bands);
	banded = mix(shadow_floor, 1.0, banded);
	DIFFUSE_LIGHT += ALBEDO * LIGHT_COLOR * ATTENUATION * banded;

	// Fresnel rim, tinted cool.
	float rim = 1.0 - clamp(dot(normalize(NORMAL), normalize(VIEW)), 0.0, 1.0);
	rim = smoothstep(1.0 - rim_amount, 1.0, rim) * ndotl;
	DIFFUSE_LIGHT += rim_color.rgb * rim * ATTENUATION * 0.4;
}
