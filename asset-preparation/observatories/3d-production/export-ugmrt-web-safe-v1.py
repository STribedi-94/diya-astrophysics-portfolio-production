import bpy
from pathlib import Path

# ============================================================
# DIYA ASTRA — uGMRT FAST GLTF-SAFE MATERIAL CONVERSION v1
# Blender 4.5.x
# ============================================================
#
# PURPOSE
# -------
# Create a non-destructive web-safe uGMRT GLB derivative.
#
# uGMRT is already largely glTF-safe because almost all materials
# are standard Principled BSDF materials.
#
# Only the procedural main ground material requires flattening.
#
# Special care is taken to preserve:
#   * open low-alpha reflector mesh identity;
#   * beacon emission;
#   * ordinary Principled materials unchanged;
#   * authoritative source .blend without saving/modifying it.
#
# ============================================================


SOURCE_BLEND = Path(bpy.data.filepath).resolve()

if not SOURCE_BLEND.name.lower().endswith(".blend"):
    raise RuntimeError(
        "This script must be run with the authoritative uGMRT .blend file."
    )


UGMRT_ROOT = SOURCE_BLEND.parent.parent

EXPORT_DIR = UGMRT_ROOT / "exports"

EXPORT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


OUTPUT_GLB = (
    EXPORT_DIR
    / "ugmrt-facility-web-safe-v1.glb"
)


# ============================================================
# MATERIAL IDENTITIES
# ============================================================

GROUND_SOURCE_NAME = "UGMRT_Dry_Field"

GROUND_WEB_NAME = "WEBSAFE__UGMRT_Dry_Field"

REFLECTOR_NAME = "UGMRT_Reflector_Mesh"

BEACON_NAME = "UGMRT_Beacon_Red"


# Representative dry-field colour derived from the accepted
# V5.6 three-tone macro ground ramp.
#
# Original controlled tones:
# low    = (0.115, 0.075, 0.030)
# middle = (0.205, 0.145, 0.060)
# high   = (0.285, 0.215, 0.105)
#
# The following value preserves the broad intended earth identity
# without depending on unsupported procedural nodes.
GROUND_WEB_COLOUR = (
    0.205,
    0.145,
    0.060,
    1.0,
)

GROUND_WEB_ROUGHNESS = 0.97

GROUND_WEB_METALLIC = 0.0


# ============================================================
# HELPERS
# ============================================================

def find_principled(material):
    if (
        material is None
        or not material.use_nodes
        or material.node_tree is None
    ):
        return None

    for node in material.node_tree.nodes:
        if (
            node.bl_idname
            == "ShaderNodeBsdfPrincipled"
        ):
            return node

    return None


def scalar_from_principled(
    material,
    socket_name,
    fallback,
):
    principled = find_principled(
        material
    )

    if principled is None:
        return fallback

    socket = principled.inputs.get(
        socket_name
    )

    if (
        socket is not None
        and not socket.is_linked
    ):
        try:
            return float(
                socket.default_value
            )
        except (
            TypeError,
            ValueError,
        ):
            return fallback

    return fallback


def create_web_ground_material():
    material = bpy.data.materials.new(
        name=GROUND_WEB_NAME
    )

    material.use_nodes = True

    node_tree = material.node_tree

    node_tree.nodes.clear()

    output = node_tree.nodes.new(
        "ShaderNodeOutputMaterial"
    )

    principled = node_tree.nodes.new(
        "ShaderNodeBsdfPrincipled"
    )

    principled.inputs[
        "Base Color"
    ].default_value = GROUND_WEB_COLOUR

    principled.inputs[
        "Roughness"
    ].default_value = (
        GROUND_WEB_ROUGHNESS
    )

    principled.inputs[
        "Metallic"
    ].default_value = (
        GROUND_WEB_METALLIC
    )

    node_tree.links.new(
        principled.outputs["BSDF"],
        output.inputs["Surface"],
    )

    material.diffuse_color = (
        GROUND_WEB_COLOUR
    )

    return material


def configure_reflector_material(
    material,
):
    """
    Preserve the open-wire reflector identity.

    The authoritative source uses low alpha because the
    reflector is intended to read as an open stretched mesh,
    not as a solid dish.
    """

    principled = find_principled(
        material
    )

    if principled is None:
        return False

    alpha_socket = (
        principled.inputs.get("Alpha")
    )

    if alpha_socket is not None:
        alpha_socket.default_value = 0.15

    try:
        material.surface_render_method = (
            "DITHERED"
        )
    except Exception:
        pass

    try:
        material.use_transparency_overlap = (
            False
        )
    except Exception:
        pass

    try:
        material.use_backface_culling = False
    except Exception:
        pass

    try:
        material.diffuse_color[3] = 0.15
    except Exception:
        pass

    return True


def verify_beacon_material(
    material,
):
    principled = find_principled(
        material
    )

    if principled is None:
        return False

    emission_color = (
        principled.inputs.get(
            "Emission Color"
        )
    )

    emission_strength = (
        principled.inputs.get(
            "Emission Strength"
        )
    )

    if emission_color is not None:
        emission_color.default_value = (
            1.0,
            0.01,
            0.01,
            1.0,
        )

    if emission_strength is not None:
        emission_strength.default_value = (
            8.0
        )

    return True


# ============================================================
# START
# ============================================================

print("")

print(
    "============================================================"
)

print(
    "DIYA ASTRA — uGMRT FAST GLTF-SAFE MATERIAL CONVERSION v1"
)

print(
    "============================================================"
)

print(
    "Source :",
    SOURCE_BLEND,
)

print(
    "Output :",
    OUTPUT_GLB,
)

print("")


# ============================================================
# REMOVE CAMERAS / LIGHTS
# TEMPORARY PROCESS ONLY
# ============================================================

removed_cameras = 0
removed_lights = 0

for obj in list(
    bpy.data.objects
):

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


# ============================================================
# LOCATE SPECIAL MATERIALS
# ============================================================

ground_source = (
    bpy.data.materials.get(
        GROUND_SOURCE_NAME
    )
)

if ground_source is None:
    raise RuntimeError(
        "Expected uGMRT ground material "
        f"'{GROUND_SOURCE_NAME}' was not found."
    )


reflector_material = (
    bpy.data.materials.get(
        REFLECTOR_NAME
    )
)

if reflector_material is None:
    raise RuntimeError(
        "Expected uGMRT reflector material "
        f"'{REFLECTOR_NAME}' was not found."
    )


beacon_material = (
    bpy.data.materials.get(
        BEACON_NAME
    )
)

if beacon_material is None:
    raise RuntimeError(
        "Expected uGMRT beacon material "
        f"'{BEACON_NAME}' was not found."
    )


# ============================================================
# CREATE WEB-SAFE GROUND
# ============================================================

web_ground = (
    create_web_ground_material()
)


ground_slot_replacements = 0

for obj in bpy.context.scene.objects:

    if (
        obj.type != "MESH"
        or getattr(
            obj,
            "data",
            None,
        ) is None
    ):
        continue

    for slot_index, material in enumerate(
        obj.data.materials
    ):

        if material == ground_source:

            obj.data.materials[
                slot_index
            ] = web_ground

            ground_slot_replacements += 1


# ============================================================
# PRESERVE REFLECTOR TRANSPARENCY
# ============================================================

reflector_configured = (
    configure_reflector_material(
        reflector_material
    )
)


# ============================================================
# PRESERVE BEACON EMISSION
# ============================================================

beacon_configured = (
    verify_beacon_material(
        beacon_material
    )
)


# ============================================================
# MATERIAL AUDIT
# ============================================================

material_names = sorted(
    material.name
    for material in bpy.data.materials
    if material is not None
)


print(
    "Ground procedural material :",
    GROUND_SOURCE_NAME,
)

print(
    "Ground replacement material:",
    GROUND_WEB_NAME,
)

print(
    "Ground slot replacements   :",
    ground_slot_replacements,
)

print(
    "Reflector transparency kept:",
    reflector_configured,
)

print(
    "Beacon emission kept       :",
    beacon_configured,
)

print(
    "Removed cameras            :",
    removed_cameras,
)

print(
    "Removed lights             :",
    removed_lights,
)

print(
    "Total materials            :",
    len(material_names),
)

print("")


print(
    "Materials:"
)

for name in material_names:
    print(
        "  -",
        name,
    )


# ============================================================
# SAFETY CHECKS
# ============================================================

if ground_slot_replacements == 0:
    raise RuntimeError(
        "uGMRT ground material existed but no mesh slots "
        "were replaced."
    )


if not reflector_configured:
    raise RuntimeError(
        "uGMRT reflector transparency could not be verified."
    )


if not beacon_configured:
    raise RuntimeError(
        "uGMRT beacon emission could not be verified."
    )


# ============================================================
# EXPORT
# ============================================================

print("")

print(
    "Starting uGMRT web-safe GLB export..."
)

print("")


result = bpy.ops.export_scene.gltf(
    filepath=str(
        OUTPUT_GLB
    ),

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
        "glTF exporter did not finish successfully: "
        f"{result}"
    )


if not OUTPUT_GLB.exists():
    raise RuntimeError(
        "Expected uGMRT web-safe GLB was not created."
    )


size_bytes = (
    OUTPUT_GLB.stat().st_size
)

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
    "uGMRT WEB-SAFE V1 EXPORT COMPLETE"
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
    "Ground flattened       : YES"
)

print(
    "Reflector transparency : PRESERVED"
)

print(
    "Beacon emission        : PRESERVED"
)

print(
    "Source saved/modified  : NO"
)

print(
    "============================================================"
)

print("")