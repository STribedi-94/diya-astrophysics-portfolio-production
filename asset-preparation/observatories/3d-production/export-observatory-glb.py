import bpy
import os
import sys
from pathlib import Path

# ------------------------------------------------------------
# DIYA ASTRA — OBSERVATORY WEB GLB EXPORTER
# Blender 4.5 LTS
# ------------------------------------------------------------

argv = sys.argv

if "--" not in argv:
    raise RuntimeError(
        "Missing exporter arguments. Expected: -- <facility-id> <output-path>"
    )

args = argv[argv.index("--") + 1:]

if len(args) != 2:
    raise RuntimeError(
        "Expected exactly 2 arguments: <facility-id> <output-path>"
    )

facility_id = args[0].strip().lower()
output_path = Path(args[1]).resolve()

if facility_id not in {"dot", "hct", "ugmrt"}:
    raise RuntimeError(
        f"Unsupported facility id: {facility_id}"
    )

output_path.parent.mkdir(
    parents=True,
    exist_ok=True,
)

print("")
print("============================================================")
print("DIYA ASTRA — OBSERVATORY WEB EXPORT")
print("============================================================")
print("Facility :", facility_id)
print("Source   :", bpy.data.filepath)
print("Output   :", output_path)
print("")

# ------------------------------------------------------------
# ENSURE OBJECT MODE
# ------------------------------------------------------------

if bpy.context.object is not None:
    try:
        if bpy.context.object.mode != "OBJECT":
            bpy.ops.object.mode_set(
                mode="OBJECT",
            )
    except Exception:
        pass

# ------------------------------------------------------------
# EXPORT SANITIZATION
# ------------------------------------------------------------
#
# Keep:
# - meshes
# - empties required for hierarchy / instances
#
# Exclude:
# - Blender cameras
# - Blender lights
#
# Project Astra owns:
# - cinematic camera system
# - destination cameras
# - dynamic lighting
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

print(
    "Removed cameras :",
    removed_cameras,
)

print(
    "Removed lights  :",
    removed_lights,
)

# ------------------------------------------------------------
# REMOVE CLEARLY HIDDEN / DEVELOPMENT-ONLY OBJECTS
# ------------------------------------------------------------

removed_hidden = 0

for obj in list(bpy.data.objects):
    if obj.hide_render:
        bpy.data.objects.remove(
            obj,
            do_unlink=True,
        )
        removed_hidden += 1

print(
    "Removed render-hidden objects :",
    removed_hidden,
)

# ------------------------------------------------------------
# REMOVE EMPTY PROTOTYPE COLLECTIONS THAT HAVE NO SCENE USERS
# ------------------------------------------------------------

for collection in list(
    bpy.data.collections
):
    if (
        collection.name.endswith(
            "_PROTOTYPE"
        )
        and collection.users == 0
    ):
        bpy.data.collections.remove(
            collection,
        )

# ------------------------------------------------------------
# SCENE STATISTICS
# ------------------------------------------------------------

mesh_count = sum(
    1
    for obj in bpy.data.objects
    if obj.type == "MESH"
)

empty_count = sum(
    1
    for obj in bpy.data.objects
    if obj.type == "EMPTY"
)

material_count = len(
    bpy.data.materials
)

print("")
print("Scene export statistics")
print("-----------------------")
print("Meshes    :", mesh_count)
print("Empties   :", empty_count)
print("Materials :", material_count)

# ------------------------------------------------------------
# EXPORT
# ------------------------------------------------------------
#
# GLB selected because it packages geometry/material data into
# one web-delivery file.
#
# Cameras/lights have already been removed from this temporary
# background Blender process.
#
# IMPORTANT:
# This process does NOT save the source .blend.
# ------------------------------------------------------------

result = bpy.ops.export_scene.gltf(
    filepath=str(
        output_path
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

print("")
print(
    "Exporter result :",
    result,
)

if not output_path.exists():
    raise RuntimeError(
        "GLB export finished but output file was not created."
    )

size_bytes = (
    output_path.stat().st_size
)

size_mb = (
    size_bytes /
    1024 /
    1024
)

print("")
print("============================================================")
print("EXPORT COMPLETE")
print("============================================================")
print("Facility :", facility_id)
print("GLB      :", output_path)
print(
    "Size     :",
    f"{size_mb:.2f} MB",
)
print("============================================================")
print("")