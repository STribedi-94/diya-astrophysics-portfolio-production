from pathlib import Path
import bpy
from mathutils import Vector


# ============================================================
# DIYA ASTRA
# OBSERVATORY CINEMATIC FOCAL-TARGET AUDIT v1
# Blender 4.5.x
# ============================================================
#
# PURPOSE
# -------
# Final read-only spatial measurement before Project Astra
# Observatory camera integration.
#
# TARGETS
# -------
# DOT:
#   Primary telescope enclosure / dome focal structure.
#
# HCT:
#   Main telescope building / dome focal structure.
#
# uGMRT:
#   30 primary 45-m reflector objects, used to derive the
#   actual array centroid and array spatial extent.
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
# EXACT FOCAL IDENTITIES
# ============================================================

DOT_EXACT = {
    "DOT_TelescopeEnclosure",
}

DOT_PREFIXES = (
    "DOT_DomeRib_",
    "DOT_DomeSeam_",
)


HCT_EXACT = {
    "HCT_Main_Building",
    "HCT_Dome_Slit",
}

HCT_PREFIXES = (
    "HCT_Dome_Seam_",
    "HCT_Dome_Shutter_Rail_",
)


UGMRT_REFLECTOR_BASE = (
    "UGMRT_45m_Mesh_Reflector"
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


def object_world_center(obj):
    points = world_bbox_points(obj)

    if not points:
        return obj.matrix_world.translation.copy()

    return Vector((
        (
            min(p.x for p in points)
            + max(p.x for p in points)
        ) / 2.0,

        (
            min(p.y for p in points)
            + max(p.y for p in points)
        ) / 2.0,

        (
            min(p.z for p in points)
            + max(p.z for p in points)
        ) / 2.0,
    ))


def print_bounds(title, bounds):
    print("")
    print(title)

    if bounds is None:
        print(
            "  NO BOUNDS AVAILABLE"
        )
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
            round(
                bounds["min_z"],
                4
            ),
            round(
                bounds["max_z"],
                4
            ),
        )
    )


def import_glb(filepath):
    if not filepath.exists():
        raise FileNotFoundError(
            f"GLB not found: {filepath}"
        )

    clear_scene()

    bpy.ops.import_scene.gltf(
        filepath=str(filepath)
    )

    bpy.context.view_layer.update()

    return [
        obj
        for obj in bpy.context.scene.objects
        if obj.type == "MESH"
    ]


def exact_or_prefix_match(
    obj,
    exact_names,
    prefixes,
):
    if obj.name in exact_names:
        return True

    return any(
        obj.name.startswith(prefix)
        for prefix in prefixes
    )


# ============================================================
# DOT
# ============================================================

def audit_dot(filepath):
    meshes = import_glb(
        filepath
    )

    focal = [
        obj
        for obj in meshes
        if exact_or_prefix_match(
            obj,
            DOT_EXACT,
            DOT_PREFIXES,
        )
    ]

    if not focal:
        raise RuntimeError(
            "DOT focal structure was not found."
        )

    enclosure = next(
        (
            obj
            for obj in meshes
            if obj.name
            == "DOT_TelescopeEnclosure"
        ),
        None,
    )

    if enclosure is None:
        raise RuntimeError(
            "DOT_TelescopeEnclosure was not found."
        )

    bounds = bounds_from_objects(
        focal
    )

    enclosure_center = (
        object_world_center(
            enclosure
        )
    )

    print("")
    print(
        "============================================================"
    )
    print(
        "DOT — CINEMATIC FOCAL TARGET"
    )
    print(
        "============================================================"
    )

    print(
        "Focal mesh count:",
        len(focal)
    )

    print(
        "Primary enclosure center:",
        tuple(
            round(value, 4)
            for value in enclosure_center
        )
    )

    print_bounds(
        "DOT TELESCOPE/DOME FOCAL BOUNDS",
        bounds,
    )

    print("")
    print(
        "Focal objects:"
    )

    for obj in sorted(
        focal,
        key=lambda item: item.name,
    ):
        print(
            "  -",
            obj.name
        )

    return {
        "label": "DOT",
        "target": bounds["center"],
        "bounds": bounds,
        "count": len(focal),
    }


# ============================================================
# HCT
# ============================================================

def audit_hct(filepath):
    meshes = import_glb(
        filepath
    )

    focal = [
        obj
        for obj in meshes
        if exact_or_prefix_match(
            obj,
            HCT_EXACT,
            HCT_PREFIXES,
        )
    ]

    if not focal:
        raise RuntimeError(
            "HCT focal structure was not found."
        )

    main_building = next(
        (
            obj
            for obj in meshes
            if obj.name
            == "HCT_Main_Building"
        ),
        None,
    )

    if main_building is None:
        raise RuntimeError(
            "HCT_Main_Building was not found."
        )

    bounds = bounds_from_objects(
        focal
    )

    building_center = (
        object_world_center(
            main_building
        )
    )

    print("")
    print(
        "============================================================"
    )
    print(
        "HCT — CINEMATIC FOCAL TARGET"
    )
    print(
        "============================================================"
    )

    print(
        "Focal mesh count:",
        len(focal)
    )

    print(
        "Primary building center:",
        tuple(
            round(value, 4)
            for value in building_center
        )
    )

    print_bounds(
        "HCT BUILDING/DOME FOCAL BOUNDS",
        bounds,
    )

    print("")
    print(
        "Focal objects:"
    )

    for obj in sorted(
        focal,
        key=lambda item: item.name,
    ):
        print(
            "  -",
            obj.name
        )

    return {
        "label": "HCT",
        "target": bounds["center"],
        "bounds": bounds,
        "count": len(focal),
    }


# ============================================================
# uGMRT
# ============================================================

def is_primary_reflector(name):
    if name == UGMRT_REFLECTOR_BASE:
        return True

    prefix = (
        UGMRT_REFLECTOR_BASE
        + "."
    )

    if not name.startswith(
        prefix
    ):
        return False

    suffix = name[
        len(prefix):
    ]

    return suffix.isdigit()


def audit_ugmrt(filepath):
    meshes = import_glb(
        filepath
    )

    reflectors = [
        obj
        for obj in meshes
        if is_primary_reflector(
            obj.name
        )
    ]

    reflectors = sorted(
        reflectors,
        key=lambda obj: obj.name,
    )

    if len(reflectors) != 30:
        raise RuntimeError(
            "Expected exactly 30 uGMRT primary "
            f"reflectors, found {len(reflectors)}."
        )

    centers = [
        object_world_center(obj)
        for obj in reflectors
    ]

    centroid = Vector((
        sum(
            center.x
            for center in centers
        ) / len(centers),

        sum(
            center.y
            for center in centers
        ) / len(centers),

        sum(
            center.z
            for center in centers
        ) / len(centers),
    ))

    bounds = bounds_from_objects(
        reflectors
    )

    center_min_x = min(
        center.x
        for center in centers
    )

    center_max_x = max(
        center.x
        for center in centers
    )

    center_min_y = min(
        center.y
        for center in centers
    )

    center_max_y = max(
        center.y
        for center in centers
    )

    center_min_z = min(
        center.z
        for center in centers
    )

    center_max_z = max(
        center.z
        for center in centers
    )

    center_span_x = (
        center_max_x
        - center_min_x
    )

    center_span_y = (
        center_max_y
        - center_min_y
    )

    center_span_z = (
        center_max_z
        - center_min_z
    )

    center_horizontal_diagonal = (
        center_span_x ** 2
        + center_span_y ** 2
    ) ** 0.5

    print("")
    print(
        "============================================================"
    )
    print(
        "uGMRT — 30-DISH ARRAY FOCAL TARGET"
    )
    print(
        "============================================================"
    )

    print(
        "Primary reflector count:",
        len(reflectors)
    )

    print(
        "Dish-center centroid:",
        tuple(
            round(value, 4)
            for value in centroid
        )
    )

    print(
        "Dish-center X range:",
        (
            round(
                center_min_x,
                4
            ),
            round(
                center_max_x,
                4
            ),
        )
    )

    print(
        "Dish-center Y range:",
        (
            round(
                center_min_y,
                4
            ),
            round(
                center_max_y,
                4
            ),
        )
    )

    print(
        "Dish-center Z range:",
        (
            round(
                center_min_z,
                4
            ),
            round(
                center_max_z,
                4
            ),
        )
    )

    print(
        "Dish-center span XYZ:",
        (
            round(
                center_span_x,
                4
            ),
            round(
                center_span_y,
                4
            ),
            round(
                center_span_z,
                4
            ),
        )
    )

    print(
        "Dish-center horizontal D:",
        round(
            center_horizontal_diagonal,
            4
        )
    )

    print_bounds(
        "30 REFLECTOR GEOMETRY BOUNDS",
        bounds,
    )

    print("")
    print(
        "Primary reflectors:"
    )

    for obj, center in zip(
        reflectors,
        centers,
    ):
        print(
            "  -",
            obj.name,
            "center=",
            tuple(
                round(value, 4)
                for value in center
            )
        )

    return {
        "label": "uGMRT",
        "target": centroid,
        "bounds": bounds,
        "count": len(reflectors),
        "center_span": (
            center_span_x,
            center_span_y,
            center_span_z,
        ),
        "center_horizontal_diagonal":
            center_horizontal_diagonal,
    }


# ============================================================
# RUN
# ============================================================

print("")
print(
    "============================================================"
)
print(
    "DIYA ASTRA — CINEMATIC FOCAL-TARGET AUDIT"
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


dot = audit_dot(
    GLBS["DOT"]
)

hct = audit_hct(
    GLBS["HCT"]
)

ugmrt = audit_ugmrt(
    GLBS["uGMRT"]
)


print("")
print(
    "============================================================"
)
print(
    "FINAL CAMERA-TARGET MEASUREMENT SUMMARY"
)
print(
    "============================================================"
)


for result in (
    dot,
    hct,
    ugmrt,
):
    print("")

    print(
        result["label"]
    )

    print(
        "  Recommended target:",
        tuple(
            round(value, 4)
            for value
            in result["target"]
        )
    )

    print(
        "  Focal dimensions  :",
        tuple(
            round(value, 4)
            for value
            in result[
                "bounds"
            ][
                "dimensions"
            ]
        )
    )

    print(
        "  Focal horizontal D:",
        round(
            result[
                "bounds"
            ][
                "horizontal_diagonal"
            ],
            4
        )
    )

    print(
        "  Focal Z range     :",
        (
            round(
                result[
                    "bounds"
                ][
                    "min_z"
                ],
                4
            ),
            round(
                result[
                    "bounds"
                ][
                    "max_z"
                ],
                4
            ),
        )
    )


print("")

print(
    "============================================================"
)

print(
    "FOCAL-TARGET AUDIT COMPLETE — NO SOURCE FILES MODIFIED"
)

print(
    "============================================================"
)

print("")