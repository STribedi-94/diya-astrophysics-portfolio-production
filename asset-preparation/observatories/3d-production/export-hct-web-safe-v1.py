import bpy
from pathlib import Path

# ============================================================
# DIYA ASTRA — HCT FAST GLTF-SAFE MATERIAL CONVERSION v1
# Blender 4.5.x
# ============================================================
#
# PURPOSE
# -------
# Create a non-destructive web-safe HCT GLB derivative by replacing
# Blender-procedural materials with simple Principled BSDF materials
# while preserving HCT's broad visual identity.
#
# IMPORTANT
# ---------
# - The authoritative HCT .blend is never saved by this script.
# - Conversion occurs only in the temporary Blender process.
# - Cameras and lights are excluded from the exported GLB.
# - Already-simple Principled materials remain unchanged.
# ============================================================

SOURCE_BLEND = Path(bpy.data.filepath).resolve()

if not SOURCE_BLEND.name.lower().endswith(".blend"):
    raise RuntimeError("This script must be run with the HCT .blend file opened.")

HCT_ROOT = SOURCE_BLEND.parent.parent
EXPORT_DIR = HCT_ROOT / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_GLB = EXPORT_DIR / "hct-facility-web-safe-v1.glb"

SIMPLE_NODE_TYPES = {
    "ShaderNodeBsdfPrincipled",
    "ShaderNodeOutputMaterial",
}

# ----------------------------------------------------------------
# HCT MATERIAL OVERRIDES
# ----------------------------------------------------------------
#
# These values are intentionally derived from the accepted HCT authoring
# script rather than from a generic average. HCT terrain and engineered
# surfaces use multiple procedural ramps/noise systems, so a first-ramp
# average would not reliably preserve the intended Hanle colour identity.
#
OVERRIDES = {
    "HCT_Terrain_Distance_Material": (0.34, 0.285, 0.205, 1.0),
    "HCT_White_Corrugated_Metal": (0.78, 0.82, 0.84, 1.0),
    "HCT_Dome_Panel_Metal": (0.59, 0.64, 0.68, 1.0),
    "HCT_Compacted_High_Altitude_Road": (0.36, 0.30, 0.23, 1.0),
    "HCT_Wheel_Worn_Track": (0.23, 0.20, 0.16, 1.0),
    "HCT_Coarse_Road_Shoulder": (0.47, 0.40, 0.30, 1.0),
    "HCT_Engineered_Concrete_Platform": (0.405, 0.395, 0.37, 1.0),
    "HCT_Dry_Stone_Retaining_Wall": (0.305, 0.25, 0.185, 1.0),
}

ROUGHNESS_OVERRIDES = {
    "HCT_Terrain_Distance_Material": 0.93,
    "HCT_White_Corrugated_Metal": 0.42,
    "HCT_Dome_Panel_Metal": 0.31,
    "HCT_Compacted_High_Altitude_Road": 0.96,
    "HCT_Wheel_Worn_Track": 0.96,
    "HCT_Coarse_Road_Shoulder": 0.96,
    "HCT_Engineered_Concrete_Platform": 0.88,
    "HCT_Dry_Stone_Retaining_Wall": 0.96,
}

METALLIC_OVERRIDES = {
    "HCT_White_Corrugated_Metal": 0.35,
    "HCT_Dome_Panel_Metal": 0.82,
}


def find_principled(mat):
    if not mat or not mat.use_nodes or not mat.node_tree:
        return None

    for node in mat.node_tree.nodes:
        if node.bl_idname == "ShaderNodeBsdfPrincipled":
            return node

    return None


def is_simple(mat):
    if not mat or not mat.use_nodes or not mat.node_tree:
        return True

    node_types = {node.bl_idname for node in mat.node_tree.nodes}
    return node_types.issubset(SIMPLE_NODE_TYPES)


def clamp_colour(colour):
    values = list(colour[:4])

    while len(values) < 4:
        values.append(1.0)

    return tuple(
        max(0.0, min(1.0, float(value)))
        for value in values
    )


def representative_colour(mat):
    if mat.name in OVERRIDES:
        return OVERRIDES[mat.name]

    ramps = []

    if mat.use_nodes and mat.node_tree:
        for node in mat.node_tree.nodes:
            if node.bl_idname == "ShaderNodeValToRGB":
                elements = list(node.color_ramp.elements)
                if elements:
                    ramps.append(elements)

    if ramps:
        elements = ramps[0]
        colours = [
            clamp_colour(element.color)
            for element in elements
        ]

        if len(colours) == 1:
            return colours[0]

        count = float(len(colours))

        return tuple(
            sum(colour[channel] for colour in colours) / count
            for channel in range(4)
        )

    principled = find_principled(mat)

    if principled:
        base_colour = principled.inputs.get("Base Color")

        if base_colour and not base_colour.is_linked:
            return clamp_colour(base_colour.default_value)

    return clamp_colour(mat.diffuse_color)


def scalar_from_principled(mat, socket_name, fallback):
    principled = find_principled(mat)

    if not principled:
        return fallback

    socket = principled.inputs.get(socket_name)

    if socket and not socket.is_linked:
        try:
            return float(socket.default_value)
        except (TypeError, ValueError):
            return fallback

    return fallback


def material_roughness(mat):
    if mat.name in ROUGHNESS_OVERRIDES:
        return ROUGHNESS_OVERRIDES[mat.name]

    return scalar_from_principled(
        mat,
        "Roughness",
        0.82,
    )


def material_metallic(mat):
    if mat.name in METALLIC_OVERRIDES:
        return METALLIC_OVERRIDES[mat.name]

    return scalar_from_principled(
        mat,
        "Metallic",
        0.0,
    )


def make_web_material(source_material):
    web_material = bpy.data.materials.new(
        name=f"WEBSAFE__{source_material.name}"
    )

    web_material.use_nodes = True

    node_tree = web_material.node_tree
    node_tree.nodes.clear()

    output = node_tree.nodes.new(
        "ShaderNodeOutputMaterial"
    )

    principled = node_tree.nodes.new(
        "ShaderNodeBsdfPrincipled"
    )

    colour = representative_colour(
        source_material
    )

    roughness = material_roughness(
        source_material
    )

    metallic = material_metallic(
        source_material
    )

    alpha = scalar_from_principled(
        source_material,
        "Alpha",
        1.0,
    )

    principled.inputs[
        "Base Color"
    ].default_value = colour

    principled.inputs[
        "Roughness"
    ].default_value = max(
        0.20,
        min(1.0, roughness),
    )

    principled.inputs[
        "Metallic"
    ].default_value = max(
        0.0,
        min(1.0, metallic),
    )

    principled.inputs[
        "Alpha"
    ].default_value = max(
        0.0,
        min(1.0, alpha),
    )

    node_tree.links.new(
        principled.outputs["BSDF"],
        output.inputs["Surface"],
    )

    return (
        web_material,
        colour,
        roughness,
        metallic,
    )


print("")
print(
    "============================================================"
)
print(
    "DIYA ASTRA — HCT FAST GLTF-SAFE MATERIAL CONVERSION v1"
)
print(
    "============================================================"
)

print("Source :", SOURCE_BLEND)
print("Output :", OUTPUT_GLB)
print("")

# ------------------------------------------------------------
# Remove authoring cameras/lights from temporary export only
# ------------------------------------------------------------

removed_cameras = 0
removed_lights = 0

for obj in list(bpy.data.objects):

    if obj.type == "CAMERA":

        bpy.data.objects.remove(
            obj,
            do_unlink=True,
        )

        removed_cameras += 1

    elif obj.type == "LIGHT":

        bpy.data.objects.remove(
            obj,
            do_unlink=True,
        )

        removed_lights += 1


conversion = {}

converted_count = 0
simple_count = 0


# ------------------------------------------------------------
# Classify and convert materials
# ------------------------------------------------------------

for mat in list(bpy.data.materials):

    if mat is None:
        continue

    if is_simple(mat):

        simple_count += 1

        print(
            "KEEP   :",
            mat.name,
        )

        continue

    (
        web_material,
        colour,
        roughness,
        metallic,
    ) = make_web_material(mat)

    conversion[mat] = web_material

    converted_count += 1

    print(
        "CONVERT:",
        mat.name,
        "->",
        web_material.name,
        "| RGB:",
        tuple(
            round(float(value), 3)
            for value in colour[:3]
        ),
        "| Rough:",
        round(float(roughness), 3),
        "| Metal:",
        round(float(metallic), 3),
    )


# ------------------------------------------------------------
# Replace procedural materials on mesh slots
# ------------------------------------------------------------

slot_replacements = 0

for obj in bpy.context.scene.objects:

    if (
        obj.type != "MESH"
        or not getattr(obj, "data", None)
    ):
        continue

    for slot_index, mat in enumerate(
        obj.data.materials
    ):

        if mat in conversion:

            obj.data.materials[
                slot_index
            ] = conversion[mat]

            slot_replacements += 1


print("")

print(
    "Converted procedural materials :",
    converted_count,
)

print(
    "Already-simple materials      :",
    simple_count,
)

print(
    "Material slot replacements    :",
    slot_replacements,
)

print(
    "Removed cameras               :",
    removed_cameras,
)

print(
    "Removed lights                :",
    removed_lights,
)

print("")


# ------------------------------------------------------------
# Check expected HCT procedural material set
# ------------------------------------------------------------

expected_procedural = set(
    OVERRIDES
)

converted_names = {
    material.name
    for material in conversion
}

missing_expected = sorted(
    expected_procedural
    - converted_names
)

if missing_expected:

    print(
        "WARNING: expected procedural materials not converted:"
    )

    for name in missing_expected:
        print("  -", name)

    print("")


# ------------------------------------------------------------
# GLB EXPORT
# ------------------------------------------------------------

result = bpy.ops.export_scene.gltf(
    filepath=str(OUTPUT_GLB),

    export_format="GLB",

    use_visible=True,

    export_cameras=False,
    export_lights=False,

    export_materials="EXPORT",

    export_apply=True,

    export_yup=True,

    export_animations=False,

    export_extras=True,
)


print(
    "Exporter result:",
    result,
)


if "FINISHED" not in result:

    raise RuntimeError(
        f"glTF exporter did not finish successfully: {result}"
    )


if not OUTPUT_GLB.exists():

    raise RuntimeError(
        "Expected HCT web-safe GLB was not created."
    )


size_bytes = OUTPUT_GLB.stat().st_size

size_mb = (
    size_bytes
    / 1024
    / 1024
)


print("")

print(
    "============================================================"
)

print(
    "HCT WEB-SAFE V1 EXPORT COMPLETE"
)

print(
    "============================================================"
)

print(
    "GLB      :",
    OUTPUT_GLB,
)

print(
    "Bytes    :",
    size_bytes,
)

print(
    "Size     :",
    f"{size_mb:.2f} MB",
)

print(
    "Source saved/modified : NO"
)

print(
    "============================================================"
)

print("")