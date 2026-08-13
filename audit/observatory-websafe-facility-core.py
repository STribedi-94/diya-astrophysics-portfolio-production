from pathlib import Path
import bpy
from mathutils import Vector


# ============================================================
# DIYA ASTRA
# THREE-OBSERVATORY FACILITY-CORE SPATIAL AUDIT v1
# Blender 4.5.x
# ============================================================
#
# PURPOSE
# -------
# Measure the visually important observatory/facility core
# separately from the giant environment/horizon footprint.
#
# This is the second spatial-audit stage after whole-model bounds.
#
# REPORTS
# -------
# - whole-model bounds
# - facility/core bounds
# - facility/core center
# - facility/core dimensions
# - core horizontal diagonal
# - core Z range
# - classified core/environment object counts
#
# SAFETY
# ------
# READ-ONLY.
# No GLB, .blend, or Astra runtime file is saved/modified.
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


# ============================================================
# CLASSIFICATION RULES
# ============================================================
#
# We intentionally classify by semantic object names.
# Giant terrain/horizon/environment meshes are excluded from the
# facility-core bounds because they distort the actual camera target.
#
# The rules are conservative:
# - explicitly exclude terrain, horizon, mountain, lake, field, road,
#   vegetation and generic environment objects;
# - include telescope/facility structural objects;
# - include uGMRT antenna-array structures while excluding landscape.
# ============================================================


ENVIRONMENT_KEYWORDS = (
    "terrain",
    "mountain",
    "horizon",
    "field",
    "lake",
    "shore",
    "road",
    "track",
    "tree",
    "shrub",
    "grass",
    "rock",
    "cloud",
    "vegetation",
    "landscape",
    "transition",
    "ground",
)


DOT_CORE_KEYWORDS = (
    "telescope",
    "enclosure",
    "dome",
    "facility",
    "observatory",
    "building",
    "tower",
    "platform",
    "railing",
    "rail",
    "stair",
    "door",
    "window",
    "service",
    "antenna",
    "dish",
)


HCT_CORE_KEYWORDS = (
    "dome",
    "slit",
    "shutter",
    "facility",
    "building",
    "service_rail",
    "platform",
    "communications_dish",
    "dish_feed",
    "dish_leg",
    "foundation",
    "observatory",
)


UGMRT_CORE_KEYWORDS = (
    "ugmrt_",
    "reflector",
    "radialrib",
    "ringrib",
    "rail",
    "pedestal",
    "azimuth",
    "service_platform",
    "upper_mount",
    "elevation_house",
    "moving_head",
    "feed",
    "rim",
    "truss",
    "fence",
    "polytunnel",
)


UGMRT_ENVIRONMENT_EXCLUSIONS = (
    "terrain",
    "horizon",
    "fieldpatch",
    "lake",
    "shore",
    "road",
    "track",
    "tree",
    "shrub",
    "hill",
    "grass",
)


# ============================================================
# HELPERS
# ============================================================


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


def bounds_from_objects(objects):
    points = []

    for obj in objects:
        points.extend(
            world_bbox_points(obj)
        )

    if not points:
        return None

    min_x = min(point.x for point in points)
    max_x = max(point.x for point in points)

    min_y = min(point.y for point in points)
    max_y = max(point.y for point in points)

    min_z = min(point.z for point in points)
    max_z = max(point.z for point in points)

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
        dimensions.x ** 2
        + dimensions.y ** 2
    ) ** 0.5

    return {
        "min": (
            min_x,
            min_y,
            min_z,
        ),
        "max": (
            max_x,
            max_y,
            max_z,
        ),
        "center": center,
        "dimensions": dimensions,
        "horizontal_diagonal": horizontal_diagonal,
        "min_z": min_z,
        "max_z": max_z,
    }


def contains_any(name, keywords):
    lowered = name.lower()

    return any(
        keyword in lowered
        for keyword in keywords
    )


def classify_dot(meshes):
    core = []

    for obj in meshes:
        name = obj.name.lower()

        if contains_any(
            name,
            ENVIRONMENT_KEYWORDS,
        ):
            continue

        if contains_any(
            name,
            DOT_CORE_KEYWORDS,
        ):
            core.append(obj)

    return core


def classify_hct(meshes):
    core = []

    for obj in meshes:
        name = obj.name.lower()

        if contains_any(
            name,
            ENVIRONMENT_KEYWORDS,
        ):
            continue

        if contains_any(
            name,
            HCT_CORE_KEYWORDS,
        ):
            core.append(obj)

    return core


def classify_ugmrt(meshes):
    core = []

    for obj in meshes:
        name = obj.name.lower()

        if contains_any(
            name,
            UGMRT_ENVIRONMENT_EXCLUSIONS,
        ):
            continue

        if contains_any(
            name,
            UGMRT_CORE_KEYWORDS,
        ):
            core.append(obj)

    return core


def print_bounds(title, bounds):
    print("")
    print(title)

    if bounds is None:
        print("  NO BOUNDS AVAILABLE")
        return

    print(
        "  Minimum      :",
        tuple(
            round(value, 4)
            for value in bounds["min"]
        )
    )

    print(
        "  Maximum      :",
        tuple(
            round(value, 4)
            for value in bounds["max"]
        )
    )

    print(
        "  Center       :",
        tuple(
            round(value, 4)
            for value in bounds["center"]
        )
    )

    print(
        "  Dimensions   :",
        tuple(
            round(value, 4)
            for value in bounds["dimensions"]
        )
    )

    print(
        "  Horizontal D :",
        round(
            bounds["horizontal_diagonal"],
            4
        )
    )

    print(
        "  Z range      :",
        (
            round(bounds["min_z"], 4),
            round(bounds["max_z"], 4),
        )
    )


def audit_facility(label, filepath):

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
        f"{label} — FACILITY-CORE SPATIAL AUDIT"
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

    if label == "DOT":
        core = classify_dot(meshes)

    elif label == "HCT":
        core = classify_hct(meshes)

    elif label == "uGMRT":
        core = classify_ugmrt(meshes)

    else:
        raise RuntimeError(
            f"Unknown facility label: {label}"
        )

    whole_bounds = bounds_from_objects(
        meshes
    )

    core_bounds = bounds_from_objects(
        core
    )

    print("")
    print(
        "All mesh objects :",
        len(meshes)
    )

    print(
        "Core mesh objects:",
        len(core)
    )

    print(
        "Environment/other:",
        len(meshes) - len(core)
    )

    print_bounds(
        "WHOLE MODEL",
        whole_bounds,
    )

    print_bounds(
        "FACILITY CORE",
        core_bounds,
    )

    print("")
    print(
        "Core object names:"
    )

    for obj in sorted(
        core,
        key=lambda item: item.name.lower(),
    ):
        print(
            "  -",
            obj.name
        )

    print("")
    print(
        f"{label} FACILITY-CORE AUDIT COMPLETE"
    )

    return {
        "label": label,
        "mesh_count": len(meshes),
        "core_count": len(core),
        "whole": whole_bounds,
        "core": core_bounds,
    }


# ============================================================
# RUN
# ============================================================


print("")
print(
    "============================================================"
)
print(
    "DIYA ASTRA — FACILITY-CORE SPATIAL AUDIT"
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
        audit_facility(
            label,
            filepath
        )
    )


print("")
print(
    "============================================================"
)
print(
    "CROSS-OBSERVATORY FACILITY-CORE SUMMARY"
)
print(
    "============================================================"
)


for result in results:

    print("")
    print(
        result["label"]
    )

    core = result["core"]

    print(
        "  Core meshes   :",
        result["core_count"]
    )

    if core is None:
        print(
            "  Core bounds   : NONE"
        )
        continue

    print(
        "  Core center   :",
        tuple(
            round(value, 4)
            for value
            in core["center"]
        )
    )

    print(
        "  Core dimensions:",
        tuple(
            round(value, 4)
            for value
            in core["dimensions"]
        )
    )

    print(
        "  Core horiz D  :",
        round(
            core["horizontal_diagonal"],
            4
        )
    )

    print(
        "  Core Z range  :",
        (
            round(
                core["min_z"],
                4
            ),
            round(
                core["max_z"],
                4
            ),
        )
    )


print("")

print(
    "============================================================"
)

print(
    "FACILITY-CORE AUDIT COMPLETE — NO SOURCE FILES MODIFIED"
)

print(
    "============================================================"
)

print("")