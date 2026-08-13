from pathlib import Path
import bpy
from mathutils import Vector


# ============================================================
# DIYA ASTRA
# THREE-OBSERVATORY WEB-SAFE GLB SPATIAL AUDIT v1
# Blender 4.5.x
# ============================================================
#
# PURPOSE
# -------
# Measure the accepted web-safe DOT, HCT and uGMRT GLBs before
# Project Astra camera integration.
#
# REPORTS
# -------
# - mesh count
# - material count
# - world-space bounding box
# - center
# - dimensions
# - horizontal footprint
# - lowest/highest Z
#
# SAFETY
# ------
# READ-ONLY AUDIT.
# No source GLB, .blend, or Astra runtime file is saved/modified.
# ============================================================


REPO_ROOT = Path.cwd().resolve()

GLBS = {
    "DOT": (
        REPO_ROOT
        / "asset-preparation"
        / "observatories"
        / "3d-production"
        / "dot"
        / "exports"
        / "dot-facility-web-safe-v2.glb"
    ),

    "HCT": (
        REPO_ROOT
        / "asset-preparation"
        / "observatories"
        / "3d-production"
        / "hct"
        / "exports"
        / "hct-facility-web-safe-v1.glb"
    ),

    "uGMRT": (
        REPO_ROOT
        / "asset-preparation"
        / "observatories"
        / "3d-production"
        / "ugmrt"
        / "exports"
        / "ugmrt-facility-web-safe-v1.glb"
    ),
}


def clear_scene():
    bpy.ops.object.select_all(
        action="SELECT"
    )

    bpy.ops.object.delete(
        use_global=False
    )

    for datablocks in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def world_bbox_points(obj):
    if obj.type != "MESH":
        return []

    matrix = obj.matrix_world

    return [
        matrix @ Vector(corner)
        for corner in obj.bound_box
    ]


def audit_glb(label, filepath):

    if not filepath.exists():
        raise FileNotFoundError(
            f"{label} GLB not found: {filepath}"
        )

    clear_scene()

    print("")
    print(
        "============================================================"
    )
    print(
        f"{label} — WEB-SAFE GLB SPATIAL AUDIT"
    )
    print(
        "============================================================"
    )

    print(
        "File:",
        filepath
    )

    bpy.ops.import_scene.gltf(
        filepath=str(filepath)
    )

    bpy.context.view_layer.update()

    meshes = [
        obj
        for obj in bpy.context.scene.objects
        if obj.type == "MESH"
    ]

    if not meshes:
        raise RuntimeError(
            f"{label}: no mesh objects found."
        )

    points = []

    for obj in meshes:
        points.extend(
            world_bbox_points(obj)
        )

    min_x = min(
        point.x for point in points
    )

    max_x = max(
        point.x for point in points
    )

    min_y = min(
        point.y for point in points
    )

    max_y = max(
        point.y for point in points
    )

    min_z = min(
        point.z for point in points
    )

    max_z = max(
        point.z for point in points
    )

    center = Vector((
        (min_x + max_x) / 2.0,
        (min_y + max_y) / 2.0,
        (min_z + max_z) / 2.0,
    ))

    dimensions = Vector((
        max_x - min_x,
        max_y - min_y,
        max_z - min_z,
    ))

    horizontal_diagonal = (
        (
            dimensions.x ** 2
            + dimensions.y ** 2
        )
        ** 0.5
    )

    materials_used = {
        slot.material.name
        for obj in meshes
        for slot in obj.material_slots
        if slot.material is not None
    }

    print("")
    print(
        "Mesh objects       :",
        len(meshes)
    )

    print(
        "Materials used     :",
        len(materials_used)
    )

    print("")

    print(
        "Bounds minimum     :",
        (
            round(min_x, 4),
            round(min_y, 4),
            round(min_z, 4),
        )
    )

    print(
        "Bounds maximum     :",
        (
            round(max_x, 4),
            round(max_y, 4),
            round(max_z, 4),
        )
    )

    print(
        "Bounds center      :",
        tuple(
            round(value, 4)
            for value in center
        )
    )

    print(
        "Dimensions XYZ     :",
        tuple(
            round(value, 4)
            for value in dimensions
        )
    )

    print(
        "Horizontal diagonal:",
        round(
            horizontal_diagonal,
            4
        )
    )

    print(
        "Lowest Z           :",
        round(min_z, 4)
    )

    print(
        "Highest Z          :",
        round(max_z, 4)
    )

    print(
        "Vertical midpoint  :",
        round(center.z, 4)
    )

    print("")

    print(
        f"{label} AUDIT COMPLETE"
    )

    return {
        "label": label,
        "center": center.copy(),
        "dimensions": dimensions.copy(),
        "horizontal_diagonal": horizontal_diagonal,
        "min_z": min_z,
        "max_z": max_z,
        "mesh_count": len(meshes),
        "material_count": len(materials_used),
    }


print("")
print(
    "============================================================"
)
print(
    "DIYA ASTRA — THREE-OBSERVATORY SPATIAL AUDIT"
)
print(
    "============================================================"
)

print(
    "Repository:",
    REPO_ROOT
)

print(
    "Mode      : READ-ONLY"
)

print("")


results = []

for label, filepath in GLBS.items():
    results.append(
        audit_glb(
            label,
            filepath
        )
    )


print("")
print(
    "============================================================"
)
print(
    "CROSS-OBSERVATORY SUMMARY"
)
print(
    "============================================================"
)

for result in results:

    print("")

    print(
        result["label"]
    )

    print(
        "  Center       :",
        tuple(
            round(value, 4)
            for value
            in result["center"]
        )
    )

    print(
        "  Dimensions   :",
        tuple(
            round(value, 4)
            for value
            in result["dimensions"]
        )
    )

    print(
        "  Horizontal D :",
        round(
            result[
                "horizontal_diagonal"
            ],
            4
        )
    )

    print(
        "  Z range      :",
        (
            round(
                result["min_z"],
                4
            ),
            round(
                result["max_z"],
                4
            ),
        )
    )


print("")

print(
    "============================================================"
)

print(
    "SPATIAL AUDIT COMPLETE — NO SOURCE FILES MODIFIED"
)

print(
    "============================================================"
)

print("")