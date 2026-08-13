import bpy
import colorsys
import re
from pathlib import Path

# ============================================================
# DIYA ASTRA — DOT FAST GLTF-SAFE MATERIAL CONVERSION v2
# Blender 4.5 LTS
# ============================================================
#
# PURPOSE
# -------
# Fast diagnostic/export pass that converts unsupported procedural
# Blender materials into glTF-safe Principled materials while preserving
# their broad intended colour identity.
#
# This is NOT a destructive edit:
# - source .blend is opened in a temporary background Blender process;
# - the source .blend is never saved;
# - original materials are duplicated/replaced only in memory;
# - output is a separate GLB.
#
# Strategy
# --------
# 1. Keep already-simple Principled materials as-is.
# 2. For procedural materials:
#    - inspect ColorRamp colours where available;
#    - otherwise inspect Principled Base Color;
#    - derive a representative web colour;
#    - preserve safe scalar roughness/metallic/alpha values;
#    - create one simple Principled material per source material.
# 3. Reassign every object using that source material to the new web-safe
#    material.
#
# This intentionally prioritizes reliable colour preservation and speed.
# Fine procedural noise/bump detail is deferred until after round-trip QA.
# ============================================================

SOURCE_BLEND = Path(bpy.data.filepath).resolve()
DOT_ROOT = SOURCE_BLEND.parent.parent
EXPORT_DIR = DOT_ROOT / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_GLB = EXPORT_DIR / "dot-facility-web-safe-v2.glb"

SIMPLE_NODE_TYPES = {
    "ShaderNodeBsdfPrincipled",
    "ShaderNodeOutputMaterial",
}

# Hand-tuned fallback overrides for materials whose intended identity is
# visually important and whose procedural graphs do not reduce well to
# a naive average.
OVERRIDES = {
    "MAT_Terrain": (0.30, 0.36, 0.23, 1.0),
    "MAT_Leaf_A": (0.12, 0.29, 0.12, 1.0),
    "MAT_Leaf_B": (0.18, 0.38, 0.16, 1.0),
    "MAT_Leaf_C": (0.26, 0.46, 0.19, 1.0),
    "MAT_ExposedSoil": (0.34, 0.24, 0.14, 1.0),
    "MAT_GroundRock": (0.30, 0.29, 0.25, 1.0),
    "MAT_NaturalRoadShoulder": (0.31, 0.27, 0.20, 1.0),
    "MAT_RetainingStone": (0.39, 0.40, 0.35, 1.0),
    "MAT_RidgeNear": (0.23, 0.31, 0.24, 1.0),
    "MAT_RidgeMid": (0.33, 0.39, 0.34, 1.0),
    "MAT_RoadConcrete": (0.47, 0.46, 0.42, 1.0),
    "MAT_CampusConcrete": (0.55, 0.53, 0.47, 1.0),
    "MAT_DOT_CorrugatedMetal": (0.66, 0.69, 0.69, 1.0),
    "MAT_DOT_CorrugatedMetal_Ext": (0.61, 0.64, 0.64, 1.0),
    "MAT_DOT_Dome": (0.77, 0.79, 0.78, 1.0),
    "MAT_DOT_OffWhite": (0.73, 0.74, 0.70, 1.0),
    "MAT_DOT_Plinth": (0.42, 0.43, 0.40, 1.0),
}

def find_principled(mat):
    if not mat or not mat.use_nodes or not mat.node_tree:
        return None
    for n in mat.node_tree.nodes:
        if n.bl_idname == "ShaderNodeBsdfPrincipled":
            return n
    return None

def is_simple(mat):
    if not mat or not mat.use_nodes or not mat.node_tree:
        return True
    types = {n.bl_idname for n in mat.node_tree.nodes}
    return types.issubset(SIMPLE_NODE_TYPES)

def srgb_tuple_to_linearish(c):
    # Blender ColorRamp values are already usable as linear float colours for
    # Principled assignment in this context; simply clamp.
    return tuple(max(0.0, min(1.0, float(v))) for v in c[:4])

def representative_colour(mat):
    if mat.name in OVERRIDES:
        return OVERRIDES[mat.name]

    ramps = []
    if mat.use_nodes and mat.node_tree:
        for node in mat.node_tree.nodes:
            if node.bl_idname == "ShaderNodeValToRGB":
                elems = list(node.color_ramp.elements)
                if elems:
                    ramps.append(elems)

    if ramps:
        # Prefer the first ramp and compute a gently weighted midpoint colour.
        elems = ramps[0]
        cols = [srgb_tuple_to_linearish(e.color) for e in elems]
        if len(cols) == 1:
            return cols[0]
        # Average all ramp stops, preserving overall material identity.
        n = float(len(cols))
        return tuple(sum(c[i] for c in cols) / n for i in range(4))

    principled = find_principled(mat)
    if principled:
        base = principled.inputs.get("Base Color")
        if base and not base.is_linked:
            return tuple(base.default_value)

    # Last resort: material viewport diffuse colour.
    return tuple(mat.diffuse_color)

def scalar_from_principled(mat, name, fallback):
    p = find_principled(mat)
    if not p:
        return fallback
    sock = p.inputs.get(name)
    if sock and not sock.is_linked:
        try:
            return float(sock.default_value)
        except Exception:
            return fallback
    return fallback

def make_web_material(src):
    mat = bpy.data.materials.new(name=f"WEBSAFE__{src.name}")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")

    colour = representative_colour(src)
    bsdf.inputs["Base Color"].default_value = colour

    rough = scalar_from_principled(src, "Roughness", 0.82)
    metal = scalar_from_principled(src, "Metallic", 0.0)
    alpha = scalar_from_principled(src, "Alpha", 1.0)

    # Conservative web-safe surface response.
    bsdf.inputs["Roughness"].default_value = max(0.45, min(1.0, rough))
    bsdf.inputs["Metallic"].default_value = max(0.0, min(1.0, metal))
    bsdf.inputs["Alpha"].default_value = max(0.0, min(1.0, alpha))

    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    return mat, colour

print("")
print("============================================================")
print("DIYA ASTRA — DOT FAST GLTF-SAFE MATERIAL CONVERSION v2")
print("============================================================")
print("Source :", SOURCE_BLEND)
print("Output :", OUTPUT_GLB)
print("")

# Remove cameras/lights from this temporary export process only.
for obj in list(bpy.data.objects):
    if obj.type in {"CAMERA", "LIGHT"}:
        bpy.data.objects.remove(obj, do_unlink=True)

conversion = {}
converted_count = 0
simple_count = 0

for mat in list(bpy.data.materials):
    if mat is None:
        continue

    if is_simple(mat):
        simple_count += 1
        continue

    webmat, colour = make_web_material(mat)
    conversion[mat] = webmat
    converted_count += 1

    print(
        "CONVERT:",
        mat.name,
        "->",
        webmat.name,
        "| RGB:",
        tuple(round(float(x), 3) for x in colour[:3]),
    )

# Reassign all object material slots.
slot_replacements = 0

for obj in bpy.context.scene.objects:
    if obj.type != "MESH":
        continue

    for slot_index, mat in enumerate(obj.data.materials):
        if mat in conversion:
            obj.data.materials[slot_index] = conversion[mat]
            slot_replacements += 1

print("")
print("Converted procedural materials :", converted_count)
print("Already-simple materials      :", simple_count)
print("Material slot replacements    :", slot_replacements)
print("")

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

print("Exporter result:", result)

if not OUTPUT_GLB.exists():
    raise RuntimeError("Expected v2 GLB was not created.")

size_mb = OUTPUT_GLB.stat().st_size / 1024 / 1024

print("")
print("============================================================")
print("DOT WEB-SAFE V2 EXPORT COMPLETE")
print("============================================================")
print("GLB      :", OUTPUT_GLB)
print("Size     :", f"{size_mb:.2f} MB")
print("Source saved/modified : NO")
print("============================================================")
print("")
