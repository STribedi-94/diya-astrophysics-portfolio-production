import bpy
import math
import os
import random
from mathutils import Vector

# ============================================================
# DIYA ASTRA — uGMRT COMPLETE ENVIRONMENT V3
# COMPOSITION / SCALE / LANDSCAPE CORRECTION
# ============================================================

SCRIPT_SIGNATURE = "UGMRT_V5_6_FINAL_ENVIRONMENT_POLISH_20260813"
SEED = 20260813
random.seed(SEED)

ROOT_COLLECTION = "UGMRT_GENERATED"
MASTER_COLLECTION = "UGMRT_MASTER_ANTENNA_COLLECTION"
TREE_COLLECTION = "UGMRT_TREE_PROTOTYPE"
SHRUB_COLLECTION = "UGMRT_SHRUB_PROTOTYPE"

DISH_DIAMETER = 45.0
DISH_RADIUS = DISH_DIAMETER / 2.0
DISH_DEPTH = 7.0
FOCAL_LENGTH = (DISH_RADIUS * DISH_RADIUS) / (4.0 * DISH_DEPTH)

PIVOT_HEIGHT = 18.0
DISH_ELEVATION_DEG = 46.0
ARRAY_AZIMUTH_DEG = 14.0

# ------------------------------------------------------------
# V3 MAJOR CHANGE:
# compress representative site footprint
# ------------------------------------------------------------

ARRAY_SCALE = 0.58

# ------------------------------------------------------------
# V5 review findings:
# - central cluster reads as overcrowded; expand it ~25% while
#   leaving the long arm distances broadly as they were
# - the arm-to-core transition should be gradual, not a hard knot
#   followed by ruler-straight lines
# ------------------------------------------------------------
CENTRAL_EXPANSION = 1.25
EXPANSION_INNER_RADIUS = 60.0
EXPANSION_OUTER_RADIUS = 340.0
POSITION_JITTER_SEED = 20260814

WORLD_HALF = 980.0
TERRAIN_GRID = 96

# Far horizon skirt: the core terrain (+/- WORLD_HALF) now extends
# outward through 2 low, gentle bands so no camera can ever see a
# hard terrain edge against the sky. Bands share exact boundary
# vertices with the ring inside them (same seam-avoidance technique
# used for the DOT/HCT mountain fields) rather than resampling the
# boundary independently, which is what caused the DOT/HCT gap bug.
HORIZON_BAND_DEPTHS = (900.0, 1400.0)
HORIZON_RING_SEGMENTS = 128

LAKE_CENTER = Vector((250.0, -430.0, 0.0))
LAKE_RX = 330.0
LAKE_RY = 175.0


# ============================================================
# CLEANUP
# ============================================================

def remove_collection(name):
    col = bpy.data.collections.get(name)

    if not col:
        return

    for child in list(col.children):
        remove_collection(child.name)

    for obj in list(col.objects):
        bpy.data.objects.remove(obj, do_unlink=True)

    bpy.data.collections.remove(col)


for name in (
    ROOT_COLLECTION,
    MASTER_COLLECTION,
    TREE_COLLECTION,
    SHRUB_COLLECTION,
    "UGMRT_DRY_GRASS_PROTOTYPE",
):
    remove_collection(name)


root_col = bpy.data.collections.new(ROOT_COLLECTION)
bpy.context.scene.collection.children.link(root_col)

env_col = bpy.data.collections.new("UGMRT_ENVIRONMENT")
array_col = bpy.data.collections.new("UGMRT_ARRAY_INSTANCES")
roads_col = bpy.data.collections.new("UGMRT_ROADS")
veg_col = bpy.data.collections.new("UGMRT_VEGETATION")
cam_col = bpy.data.collections.new("UGMRT_CAMERAS")

root_col.children.link(env_col)
root_col.children.link(array_col)
root_col.children.link(roads_col)
root_col.children.link(veg_col)
root_col.children.link(cam_col)

master_col = bpy.data.collections.new(MASTER_COLLECTION)
tree_proto_col = bpy.data.collections.new(TREE_COLLECTION)
shrub_proto_col = bpy.data.collections.new(SHRUB_COLLECTION)


def relink(obj, collection):
    for existing in list(obj.users_collection):
        existing.objects.unlink(obj)

    collection.objects.link(obj)
    return obj


# ============================================================
# MATERIALS
# ============================================================

def make_material(
    name,
    color,
    metallic=0.0,
    roughness=0.5,
    alpha=1.0,
    emission=None,
    emission_strength=0.0,
):
    material = bpy.data.materials.get(name)

    if material is None:
        material = bpy.data.materials.new(name)

    material.use_nodes = True

    bsdf = material.node_tree.nodes.get("Principled BSDF")

    if bsdf:
        bsdf.inputs["Base Color"].default_value = (
            color[0],
            color[1],
            color[2],
            1.0,
        )

        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness

        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = alpha

        if emission is not None:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = (
                    emission[0],
                    emission[1],
                    emission[2],
                    1.0,
                )

                bsdf.inputs["Emission Strength"].default_value = (
                    emission_strength
                )

    material.diffuse_color = (
        color[0],
        color[1],
        color[2],
        alpha,
    )

    return material


MAT_CONCRETE = make_material(
    "UGMRT_Concrete",
    (0.50, 0.49, 0.45),
    roughness=0.90,
)

MAT_WHITE = make_material(
    "UGMRT_White_Structure",
    (0.88, 0.89, 0.87),
    metallic=0.06,
    roughness=0.42,
)

MAT_STEEL = make_material(
    "UGMRT_Lattice_Steel",
    (0.84, 0.85, 0.83),
    metallic=0.10,
    roughness=0.40,
)

MAT_DARK = make_material(
    "UGMRT_Mechanical_Dark",
    (0.09, 0.10, 0.10),
    metallic=0.58,
    roughness=0.28,
)

MAT_MESH = make_material(
    "UGMRT_Reflector_Mesh",
    (0.82, 0.84, 0.82),
    metallic=0.08,
    roughness=0.58,
    alpha=0.15,
)

# Reference photos (all 6) show the uGMRT reflector as a genuinely open
# stretched wire-mesh net — sky is visible through most of the dish
# surface, not a frosted/solid panel. Push the transparency far lower
# than a simple alpha value would suggest, and force proper alpha
# blending so Eevee actually renders it as see-through rather than
# a translucent haze.
try:
    MAT_MESH.blend_method = "BLEND"
    MAT_MESH.show_transparent_back = False
    MAT_MESH.use_backface_culling = False
except Exception:
    pass

MAT_RED = make_material(
    "UGMRT_Beacon_Red",
    (0.30, 0.01, 0.01),
    roughness=0.25,
    emission=(1.0, 0.01, 0.01),
    emission_strength=8.0,
)

MAT_GROUND = make_material(
    "UGMRT_Dry_Field",
    (0.255, 0.185, 0.075),
    roughness=0.97,
)

MAT_FIELD_GOLD = make_material(
    "UGMRT_Field_Gold",
    (0.235, 0.180, 0.090),
    roughness=0.985,
)

MAT_FIELD_GREEN = make_material(
    "UGMRT_Field_Green",
    (0.175, 0.195, 0.120),
    roughness=0.985,
)

MAT_FIELD_DARK = make_material(
    "UGMRT_Field_Dark",
    (0.175, 0.125, 0.065),
    roughness=0.99,
)

MAT_FIELD_LIGHT = make_material(
    "UGMRT_Field_Light",
    (0.255, 0.205, 0.120),
    roughness=0.985,
)

MAT_ROAD = make_material(
    "UGMRT_Asphalt_Road",
    (0.070, 0.070, 0.066),
    roughness=0.94,
)

MAT_TRACK = make_material(
    "UGMRT_Service_Track",
    (0.135, 0.100, 0.060),
    roughness=0.99,
)

MAT_WATER = make_material(
    "UGMRT_Lake_Water",
    (0.045, 0.115, 0.18),
    metallic=0.08,
    roughness=0.08,
)

MAT_SHORE = make_material(
    "UGMRT_Shore",
    (0.19, 0.125, 0.05),
    roughness=0.97,
)

MAT_TRUNK = make_material(
    "UGMRT_Tree_Trunk",
    (0.115, 0.070, 0.032),
    roughness=0.98,
)

MAT_LEAF = make_material(
    "UGMRT_Tree_Leaf",
    (0.045, 0.135, 0.050),
    roughness=0.97,
)

MAT_SHRUB = make_material(
    "UGMRT_Shrub",
    (0.070, 0.145, 0.050),
    roughness=0.985,
)

MAT_HILL = make_material(
    "UGMRT_Distant_Hill",
    (0.31, 0.31, 0.29),
    roughness=0.98,
)

# Horizon skirt bands — colour steps from ground-like tone (near
# band) toward a pale hazy blue-gray (far band) so the terrain
# visually dissolves into the sky instead of ending in a hard edge.
MAT_HORIZON_NEAR = make_material(
    "UGMRT_Horizon_Near",
    (0.34, 0.30, 0.245),
    roughness=0.95,
)

MAT_HORIZON_FAR = make_material(
    "UGMRT_Horizon_Far",
    (0.27, 0.30, 0.31),
    roughness=0.96,
)


# V5.6 FINAL — spatial dry-field macro variation on the MAIN terrain.
# Geometry POSITION now drives the Noise Texture. The previous V5.2 block
# did not feed spatial coordinates into Noise.Vector, so the huge terrain
# could read almost as one flat brown sheet even though the nodes existed.
# Geometry itself remains completely locked.
try:
    MAT_GROUND.use_nodes = True

    ground_nodes = MAT_GROUND.node_tree.nodes
    ground_links = MAT_GROUND.node_tree.links
    ground_bsdf = ground_nodes.get("Principled BSDF")

    ground_geometry = ground_nodes.get("UGMRT_Ground_Geometry")
    if ground_geometry is None:
        ground_geometry = ground_nodes.new("ShaderNodeNewGeometry")
        ground_geometry.name = "UGMRT_Ground_Geometry"

    ground_noise = ground_nodes.get("UGMRT_Ground_Macro_Noise")
    if ground_noise is None:
        ground_noise = ground_nodes.new("ShaderNodeTexNoise")
        ground_noise.name = "UGMRT_Ground_Macro_Noise"

    # Position is in scene/object-scale metres here. A very low Scale therefore
    # creates broad field-sized tonal regions rather than tiny procedural grain.
    ground_noise.noise_dimensions = "3D"
    ground_noise.inputs["Scale"].default_value = 0.0060
    ground_noise.inputs["Detail"].default_value = 2.0
    ground_noise.inputs["Roughness"].default_value = 0.55

    if "Lacunarity" in ground_noise.inputs:
        ground_noise.inputs["Lacunarity"].default_value = 2.0

    ground_ramp = ground_nodes.get("UGMRT_Ground_Macro_Ramp")
    if ground_ramp is None:
        ground_ramp = ground_nodes.new("ShaderNodeValToRGB")
        ground_ramp.name = "UGMRT_Ground_Macro_Ramp"

    ramp = ground_ramp.color_ramp

    # Keep exactly three controlled earth tones.
    while len(ramp.elements) > 2:
        ramp.elements.remove(ramp.elements[-1])

    low = ramp.elements[0]
    high = ramp.elements[1]
    low.position = 0.22
    high.position = 0.80

    low.color = (0.115, 0.075, 0.030, 1.0)
    high.color = (0.285, 0.215, 0.105, 1.0)

    middle = ramp.elements.new(0.50)
    middle.color = (0.205, 0.145, 0.060, 1.0)

    # Remove only links into the sockets this block owns, making reruns clean.
    for link in list(ground_links):
        if (
            link.to_node == ground_noise
            and link.to_socket == ground_noise.inputs["Vector"]
        ):
            ground_links.remove(link)

    for link in list(ground_links):
        if (
            link.to_node == ground_ramp
            and link.to_socket == ground_ramp.inputs["Fac"]
        ):
            ground_links.remove(link)

    if ground_bsdf is not None:
        for link in list(ground_links):
            if (
                link.to_node == ground_bsdf
                and link.to_socket == ground_bsdf.inputs["Base Color"]
            ):
                ground_links.remove(link)

    ground_links.new(
        ground_geometry.outputs["Position"],
        ground_noise.inputs["Vector"],
    )

    ground_links.new(
        ground_noise.outputs["Fac"],
        ground_ramp.inputs["Fac"],
    )

    if ground_bsdf is not None:
        ground_links.new(
            ground_ramp.outputs["Color"],
            ground_bsdf.inputs["Base Color"],
        )

except Exception as ground_polish_error:
    print(
        "FINAL GROUND MATERIAL POLISH WARNING:",
        ground_polish_error,
    )



# ============================================================
# BASIC HELPERS
# ============================================================

def add_cube(
    name,
    location,
    scale,
    material,
    collection,
    parent=None,
):
    bpy.ops.mesh.primitive_cube_add(
        location=location,
    )

    obj = bpy.context.object
    obj.name = name
    obj.scale = scale

    bpy.ops.object.transform_apply(
        location=False,
        rotation=False,
        scale=True,
    )

    if material:
        obj.data.materials.append(material)

    if parent:
        obj.parent = parent

    return relink(obj, collection)


def add_cylinder(
    name,
    radius,
    depth,
    location,
    material,
    collection,
    vertices=24,
    rotation=(0.0, 0.0, 0.0),
    parent=None,
):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
        rotation=rotation,
    )

    obj = bpy.context.object
    obj.name = name

    if material:
        obj.data.materials.append(material)

    if parent:
        obj.parent = parent

    return relink(obj, collection)


def add_cone(
    name,
    radius1,
    radius2,
    depth,
    location,
    material,
    collection,
    vertices=32,
    parent=None,
):
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        location=location,
    )

    obj = bpy.context.object
    obj.name = name

    if material:
        obj.data.materials.append(material)

    if parent:
        obj.parent = parent

    return relink(obj, collection)


def add_ico(
    name,
    location,
    scale,
    material,
    collection,
    subdivisions=1,
    parent=None,
    smooth=True,
):
    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=subdivisions,
        radius=1.0,
        location=location,
    )

    obj = bpy.context.object
    obj.name = name
    obj.scale = scale

    bpy.ops.object.transform_apply(
        location=False,
        rotation=False,
        scale=True,
    )

    if material:
        obj.data.materials.append(material)

    if smooth:
        for polygon in obj.data.polygons:
            polygon.use_smooth = True

    if parent:
        obj.parent = parent

    return relink(obj, collection)


def add_beam(
    name,
    start,
    end,
    radius,
    material,
    collection,
    parent=None,
    vertices=8,
):
    start = Vector(start)
    end = Vector(end)

    direction = end - start

    if direction.length < 0.00001:
        return None

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=direction.length,
        location=(start + end) * 0.5,
    )

    obj = bpy.context.object
    obj.name = name

    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = direction.to_track_quat(
        "Z",
        "Y",
    )

    if material:
        obj.data.materials.append(material)

    if parent:
        obj.parent = parent

    return relink(obj, collection)


def add_curve(
    name,
    points,
    bevel_depth,
    material,
    collection,
    cyclic=False,
    parent=None,
):
    curve = bpy.data.curves.new(
        name + "_Curve",
        "CURVE",
    )

    curve.dimensions = "3D"
    curve.resolution_u = 1
    curve.bevel_depth = bevel_depth
    curve.bevel_resolution = 1

    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)

    for index, point in enumerate(points):
        spline.points[index].co = (
            point[0],
            point[1],
            point[2],
            1.0,
        )

    spline.use_cyclic_u = cyclic

    obj = bpy.data.objects.new(
        name,
        curve,
    )

    collection.objects.link(obj)

    if material:
        curve.materials.append(material)

    if parent:
        obj.parent = parent

    return obj


# ============================================================
# TERRAIN
# ============================================================

def terrain_base_height(x, y):
    return (
        1.15 * math.sin(x * 0.0060)
        + 0.90 * math.cos(y * 0.0068)
        + 0.46 * math.sin((x + y) * 0.0115)
        + 0.28 * math.cos((x - y) * 0.0140)
        + 0.55 * math.sin((0.35 * x - 0.18 * y) * 0.0042)
    )


def terrain_height(x, y):
    z = terrain_base_height(x, y)

    # V5.2 coherent lake basin:
    # the previous quadratic depression was deepest only at the centre,
    # while the constant water plane stayed far below the lake perimeter.
    # That allowed only disconnected blue shards to appear through the
    # terrain. Keep the same lake position/size but form a shallow,
    # continuous basin beneath the complete water footprint.
    lake_q = math.sqrt(
        (
            (x - LAKE_CENTER.x)
            / LAKE_RX
        ) ** 2
        +
        (
            (y - LAKE_CENTER.y)
            / LAKE_RY
        ) ** 2
    )

    if lake_q <= 1.0:
        basin_floor = -1.55 - 0.30 * (1.0 - lake_q)
        z = min(z, basin_floor)

    elif lake_q < 1.22:
        t = (lake_q - 1.0) / 0.22
        t = t * t * (3.0 - 2.0 * t)
        shoulder_floor = -1.55 * (1.0 - t)
        z = min(z, shoulder_floor)

    return z


vertices = []
faces = []

N = TERRAIN_GRID

for iy in range(N + 1):
    y = -WORLD_HALF + (
        2.0 * WORLD_HALF * iy / N
    )

    for ix in range(N + 1):
        x = -WORLD_HALF + (
            2.0 * WORLD_HALF * ix / N
        )

        vertices.append(
            (
                x,
                y,
                terrain_height(x, y),
            )
        )


for iy in range(N):
    for ix in range(N):
        a = iy * (N + 1) + ix
        b = a + 1
        c = a + (N + 1) + 1
        d = a + (N + 1)

        faces.append(
            (a, b, c, d)
        )


terrain_mesh = bpy.data.meshes.new(
    "UGMRT_Terrain_Mesh"
)

terrain_mesh.from_pydata(
    vertices,
    [],
    faces,
)

terrain_mesh.update()

# Flat per-quad shading is what was producing the visible
# "Blender modelling plane" grid look — smooth it so the terrain
# reads as one continuous landscape.
for polygon in terrain_mesh.polygons:
    polygon.use_smooth = True

terrain = bpy.data.objects.new(
    "UGMRT_Open_Field_Terrain",
    terrain_mesh,
)

env_col.objects.link(terrain)

terrain.data.materials.append(
    MAT_GROUND
)


# ============================================================
# HORIZON SKIRT
# (extends the terrain far past any camera frustum so no hard
# edge against the sky is ever visible — bands share exact
# boundary vertices with the ring inside them, same technique
# used to fix the DOT/HCT mountain-field seam bug)
# ============================================================

def terrain_boundary_loop():
    loop = []

    for ix in range(N):
        x = -WORLD_HALF + (2.0 * WORLD_HALF * ix / N)
        loop.append((x, -WORLD_HALF))

    for iy in range(N):
        y = -WORLD_HALF + (2.0 * WORLD_HALF * iy / N)
        loop.append((WORLD_HALF, y))

    for ix in range(N, 0, -1):
        x = -WORLD_HALF + (2.0 * WORLD_HALF * ix / N)
        loop.append((x, WORLD_HALF))

    for iy in range(N, 0, -1):
        y = -WORLD_HALF + (2.0 * WORLD_HALF * iy / N)
        loop.append((-WORLD_HALF, y))

    return loop


def build_horizon_band(
    name,
    inner_xy,
    inner_z,
    depth,
    height_damp,
    material,
):
    outer_xy = []
    outer_z = []

    for (x, y) in inner_xy:
        r = math.hypot(x, y)

        if r < 0.0001:
            dir_x, dir_y = 1.0, 0.0
        else:
            dir_x, dir_y = x / r, y / r

        ox = x + dir_x * depth
        oy = y + dir_y * depth

        oz = (
            terrain_height(x, y)
            * height_damp
            - depth * 0.0035
        )

        outer_xy.append((ox, oy))
        outer_z.append(oz)

    count = len(inner_xy)

    verts = [
        (px, py, pz)
        for (px, py), pz in zip(inner_xy, inner_z)
    ] + [
        (px, py, pz)
        for (px, py), pz in zip(outer_xy, outer_z)
    ]

    faces = []

    for index in range(count):
        a = index
        b = (index + 1) % count
        c = count + ((index + 1) % count)
        d = count + index

        faces.append((a, b, c, d))

    band_mesh = bpy.data.meshes.new(
        name + "_Mesh"
    )

    band_mesh.from_pydata(
        verts,
        [],
        faces,
    )

    band_mesh.update()

    for polygon in band_mesh.polygons:
        polygon.use_smooth = True

    band_obj = bpy.data.objects.new(
        name,
        band_mesh,
    )

    env_col.objects.link(band_obj)
    band_mesh.materials.append(material)

    return outer_xy, outer_z


boundary_xy = terrain_boundary_loop()
boundary_z = [
    terrain_height(x, y)
    for (x, y) in boundary_xy
]

near_outer_xy, near_outer_z = build_horizon_band(
    "UGMRT_Horizon_Band_Near",
    boundary_xy,
    boundary_z,
    HORIZON_BAND_DEPTHS[0],
    0.55,
    MAT_HORIZON_NEAR,
)

build_horizon_band(
    "UGMRT_Horizon_Band_Far",
    near_outer_xy,
    near_outer_z,
    HORIZON_BAND_DEPTHS[1],
    0.15,
    MAT_HORIZON_FAR,
)


# ============================================================
# IRREGULAR FIELD PATCHES
# ============================================================

def irregular_patch(
    name,
    center,
    radius_x,
    radius_y,
    material,
    points_count=10,
):
    cx, cy = center

    points = []

    for index in range(points_count):
        angle = (
            2.0
            * math.pi
            * index
            / points_count
        )

        jitter = random.uniform(
            0.82,
            1.18,
        )

        x = (
            cx
            + radius_x
            * jitter
            * math.cos(angle)
        )

        y = (
            cy
            + radius_y
            * jitter
            * math.sin(angle)
        )

        points.append(
            (
                x,
                y,
                terrain_height(x, y)
                + 0.018,
            )
        )

    mesh = bpy.data.meshes.new(
        name + "_Mesh"
    )

    verts = [
        (
            cx,
            cy,
            terrain_height(cx, cy)
            + 0.016,
        )
    ] + points

    faces = []

    for index in range(points_count):
        faces.append(
            (
                0,
                1 + index,
                1 + (
                    (index + 1)
                    % points_count
                ),
            )
        )

    mesh.from_pydata(
        verts,
        [],
        faces,
    )

    mesh.update()

    for polygon in mesh.polygons:
        polygon.use_smooth = True

    obj = bpy.data.objects.new(
        name,
        mesh,
    )

    env_col.objects.link(obj)
    mesh.materials.append(material)

    return obj


patch_specs = [
    ((-520, -220), 170, 85, MAT_FIELD_GOLD),
    ((-280, -330), 140, 75, MAT_FIELD_GREEN),
    ((30, -510), 165, 82, MAT_FIELD_DARK),
    ((420, -610), 150, 85, MAT_FIELD_GREEN),
    ((570, -250), 120, 65, MAT_FIELD_LIGHT),

    ((-590, 240), 155, 85, MAT_FIELD_GREEN),
    ((-340, 420), 145, 72, MAT_FIELD_DARK),
    ((80, 450), 180, 90, MAT_FIELD_GOLD),
    ((470, 340), 150, 80, MAT_FIELD_LIGHT),
]


for index, spec in enumerate(patch_specs):
    irregular_patch(
        f"UGMRT_FieldPatch_{index:02d}",
        spec[0],
        spec[1],
        spec[2],
        spec[3],
        points_count=28,
    )


# ============================================================
# LAKE + SHORELINE — V5.3 CORRECTED GEOMETRY
# ============================================================
#
# IMPORTANT FIX:
# The previous shoreline was accidentally built as a SECOND FILLED FAN
# from the lake centre to the outer bank. That meant the "shore" covered
# the complete lake and overlapped the water mesh, producing the large
# radial/starburst triangles visible in QA screenshots.
#
# V5.3 uses:
#   1. ONE continuous filled water polygon;
#   2. ONE true shoreline RING (outer loop -> inner loop);
#   3. no coplanar overlapping filled shoreline surface;
#   4. the same accepted lake location and overall scale.
#
# No antenna, array, road, terrain, vegetation, lighting or camera
# systems are changed by this correction.
# ============================================================

water_z = -1.05
segments = 128

water_center = (
    LAKE_CENTER.x,
    LAKE_CENTER.y,
    water_z,
)

water_vertices = [
    water_center
]

inner_bank_vertices = []
outer_bank_vertices = []

for index in range(segments):
    angle = (
        2.0
        * math.pi
        * index
        / segments
    )

    # Moderate irregularity: natural shoreline without sharp spikes.
    wobble = (
        1.0
        + 0.060 * math.sin(angle * 3.0 + 0.6)
        + 0.032 * math.sin(angle * 5.0 + 1.4)
        + 0.018 * math.sin(angle * 9.0 + 2.2)
    )

    water_x = (
        LAKE_CENTER.x
        + LAKE_RX
        * wobble
        * math.cos(angle)
    )

    water_y = (
        LAKE_CENTER.y
        + LAKE_RY
        * wobble
        * math.sin(angle)
    )

    # Inner bank is just outside water. Keep it slightly higher than
    # water to give a readable but restrained edge.
    inner_x = (
        LAKE_CENTER.x
        + (LAKE_RX + 8.0)
        * wobble
        * math.cos(angle)
    )

    inner_y = (
        LAKE_CENTER.y
        + (LAKE_RY + 6.0)
        * wobble
        * math.sin(angle)
    )

    # Outer bank defines a narrow moist-soil shoreline ring.
    outer_x = (
        LAKE_CENTER.x
        + (LAKE_RX + 30.0)
        * wobble
        * math.cos(angle)
    )

    outer_y = (
        LAKE_CENTER.y
        + (LAKE_RY + 22.0)
        * wobble
        * math.sin(angle)
    )

    water_vertices.append(
        (
            water_x,
            water_y,
            water_z,
        )
    )

    inner_bank_vertices.append(
        (
            inner_x,
            inner_y,
            water_z + 0.035,
        )
    )

    outer_bank_vertices.append(
        (
            outer_x,
            outer_y,
            water_z + 0.075,
        )
    )


# ------------------------------------------------------------
# One continuous water surface
# ------------------------------------------------------------

water_faces = []

for index in range(segments):
    water_faces.append(
        (
            0,
            1 + index,
            1 + ((index + 1) % segments),
        )
    )

water_mesh = bpy.data.meshes.new(
    "UGMRT_Lake_Mesh"
)

water_mesh.from_pydata(
    water_vertices,
    [],
    water_faces,
)

water_mesh.update()

# Keep the water surface flat. Flat normals avoid unnecessary fan-like
# shading patterns across this deliberately planar surface.
for polygon in water_mesh.polygons:
    polygon.use_smooth = False

lake_obj = bpy.data.objects.new(
    "UGMRT_Lake",
    water_mesh,
)

env_col.objects.link(
    lake_obj
)

water_mesh.materials.append(
    MAT_WATER
)


# ------------------------------------------------------------
# True shoreline ring — NOT a filled second lake
# ------------------------------------------------------------

shore_vertices = (
    inner_bank_vertices
    + outer_bank_vertices
)

shore_faces = []

for index in range(segments):
    next_index = (
        (index + 1)
        % segments
    )

    inner_a = index
    inner_b = next_index

    outer_a = segments + index
    outer_b = segments + next_index

    shore_faces.append(
        (
            inner_a,
            inner_b,
            outer_b,
            outer_a,
        )
    )

shore_mesh = bpy.data.meshes.new(
    "UGMRT_Lake_Shore_Mesh"
)

shore_mesh.from_pydata(
    shore_vertices,
    [],
    shore_faces,
)

shore_mesh.update()

for polygon in shore_mesh.polygons:
    polygon.use_smooth = True

shore_obj = bpy.data.objects.new(
    "UGMRT_Lake_Shore",
    shore_mesh,
)

env_col.objects.link(
    shore_obj
)

shore_mesh.materials.append(
    MAT_SHORE
)


# ============================================================
# SMOOTHER ROADS
# ============================================================

def catmull_rom(
    p0,
    p1,
    p2,
    p3,
    t,
):
    t2 = t * t
    t3 = t2 * t

    return 0.5 * (
        (2.0 * p1)
        + (-p0 + p2) * t
        + (
            2.0 * p0
            - 5.0 * p1
            + 4.0 * p2
            - p3
        ) * t2
        + (
            -p0
            + 3.0 * p1
            - 3.0 * p2
            + p3
        ) * t3
    )


def smooth_path(points, samples=12):
    vectors = [
        Vector((x, y))
        for x, y in points
    ]

    padded = (
        [vectors[0]]
        + vectors
        + [vectors[-1]]
    )

    output = []

    for index in range(
        1,
        len(padded) - 2,
    ):
        p0 = padded[index - 1]
        p1 = padded[index]
        p2 = padded[index + 1]
        p3 = padded[index + 2]

        for sample in range(samples):
            t = sample / samples

            p = catmull_rom(
                p0,
                p1,
                p2,
                p3,
                t,
            )

            output.append(
                (
                    p.x,
                    p.y,
                )
            )

    output.append(
        (
            vectors[-1].x,
            vectors[-1].y,
        )
    )

    return output


def road_ribbon(
    name,
    points2d,
    width,
    material,
):
    points2d = smooth_path(
        points2d,
        samples=10,
    )

    left = []
    right = []

    for index, point_tuple in enumerate(
        points2d
    ):
        point = Vector(point_tuple)

        if index == 0:
            tangent = (
                Vector(points2d[1])
                - point
            )

        elif index == len(points2d) - 1:
            tangent = (
                point
                - Vector(points2d[index - 1])
            )

        else:
            tangent = (
                Vector(points2d[index + 1])
                - Vector(points2d[index - 1])
            )

        if tangent.length < 0.0001:
            tangent = Vector((1.0, 0.0))

        tangent.normalize()

        normal = Vector(
            (
                -tangent.y,
                tangent.x,
            )
        )

        lp = (
            point
            + normal
            * width
            * 0.5
        )

        rp = (
            point
            - normal
            * width
            * 0.5
        )

        z = (
            terrain_height(
                point.x,
                point.y,
            )
            + 0.17
        )

        left.append(
            (
                lp.x,
                lp.y,
                z,
            )
        )

        right.append(
            (
                rp.x,
                rp.y,
                z,
            )
        )

    verts = []
    faces = []

    for index in range(len(points2d)):
        verts.append(left[index])
        verts.append(right[index])

    for index in range(
        len(points2d) - 1
    ):
        faces.append(
            (
                2 * index,
                2 * index + 1,
                2 * index + 3,
                2 * index + 2,
            )
        )

    mesh = bpy.data.meshes.new(
        name + "_Mesh"
    )

    mesh.from_pydata(
        verts,
        [],
        faces,
    )

    mesh.update()

    obj = bpy.data.objects.new(
        name,
        mesh,
    )

    roads_col.objects.link(obj)
    mesh.materials.append(material)

    return obj


road_ribbon(
    "UGMRT_Main_Asphalt_Road",
    [
        (-930, 145),
        (-690, 118),
        (-445, 78),
        (-190, 45),
        (55, 38),
        (300, 68),
        (555, 115),
        (805, 165),
        (945, 188),
    ],
    5.6,
    MAT_ROAD,
)


# Feeder branches — each starts from an exact point already on the
# main road above (visually connected, not a floating disconnected
# strip) and runs out toward one of the three antenna arms. Angles
# mirror ARM_ANGLES (defined later, in the antenna array section) —
# duplicated here as plain numbers since this section runs first.
road_ribbon(
    "UGMRT_Feeder_Arm_East",
    [
        (300, 68),
        (
            300 + 150 * math.cos(math.radians(10.0)),
            68 + 150 * math.sin(math.radians(10.0)),
        ),
        (
            300 + 300 * math.cos(math.radians(10.0)),
            68 + 300 * math.sin(math.radians(10.0)),
        ),
    ],
    4.0,
    MAT_TRACK,
)

road_ribbon(
    "UGMRT_Feeder_Arm_UpperLeft",
    [
        (-445, 78),
        (
            -445 + 150 * math.cos(math.radians(130.0)),
            78 + 150 * math.sin(math.radians(130.0)),
        ),
        (
            -445 + 300 * math.cos(math.radians(130.0)),
            78 + 300 * math.sin(math.radians(130.0)),
        ),
    ],
    4.0,
    MAT_TRACK,
)

road_ribbon(
    "UGMRT_Feeder_Arm_SouthLakeside",
    [
        (-190, 45),
        (-145, -18),
        (-99.5, -73),
        (-75, -150),
    ],
    4.0,
    MAT_TRACK,
)


# ============================================================
# DISTANT LOW HILLS
# ============================================================

hill_specs = []

HILL_RING_COUNT = 22
HILL_RING_RADIUS = WORLD_HALF + HORIZON_BAND_DEPTHS[0] * 0.45

for hill_index in range(HILL_RING_COUNT):
    hill_angle = (
        2.0 * math.pi * hill_index / HILL_RING_COUNT
    ) + random.uniform(-0.10, 0.10)

    hill_radius = HILL_RING_RADIUS * random.uniform(0.88, 1.10)

    hx = hill_radius * math.cos(hill_angle)
    hy = hill_radius * math.sin(hill_angle)

    hsx = random.uniform(260.0, 420.0)
    hsy = random.uniform(90.0, 150.0)
    hsz = random.uniform(72.0, 112.0)

    hill_specs.append(
        (hx, hy, hsx, hsy, hsz)
    )


for index, (
    x,
    y,
    sx,
    sy,
    sz,
) in enumerate(hill_specs):
    add_ico(
        f"UGMRT_Distant_Hill_{index:02d}",
        (
            x,
            y,
            terrain_height(x, y)
            - sz * 0.34,
        ),
        (
            sx,
            sy,
            sz,
        ),
        MAT_HILL,
        env_col,
        subdivisions=2,
    )


# ============================================================
# VEGETATION PROTOTYPES
# ============================================================

add_cylinder(
    "UGMRT_TreeProto_Trunk",
    0.36,
    5.6,
    (0, 0, 2.80),
    MAT_TRUNK,
    tree_proto_col,
    vertices=8,
)

add_ico(
    "UGMRT_TreeProto_Crown",
    (0, 0, 6.3),
    (3.4, 3.0, 2.75),
    MAT_LEAF,
    tree_proto_col,
    subdivisions=1,
)

add_ico(
    "UGMRT_ShrubProto",
    (0, 0, 0.85),
    (1.95, 1.65, 1.05),
    MAT_SHRUB,
    shrub_proto_col,
    subdivisions=1,
)


def collection_instance(
    name,
    prototype,
    location,
    scale,
    rotation_z,
):
    obj = bpy.data.objects.new(
        name,
        None,
    )

    obj.instance_type = "COLLECTION"
    obj.instance_collection = prototype

    obj.location = location
    obj.scale = scale
    obj.rotation_euler.z = rotation_z

    veg_col.objects.link(obj)

    return obj


# ------------------------------------------------------------
# Distant trees
# ------------------------------------------------------------

for index in range(105):
    angle = random.uniform(
        0.0,
        2.0 * math.pi,
    )

    radius = random.uniform(
        450.0,
        900.0,
    )

    x = radius * math.cos(angle)
    y = radius * math.sin(angle)

    lake_q = (
        (
            (x - LAKE_CENTER.x)
            / LAKE_RX
        ) ** 2
        +
        (
            (y - LAKE_CENTER.y)
            / LAKE_RY
        ) ** 2
    )

    if lake_q < 1.15:
        continue

    z = terrain_height(x, y)

    s = random.uniform(
        0.90,
        1.45,
    )

    collection_instance(
        f"UGMRT_Tree_{index:03d}",
        tree_proto_col,
        (x, y, z),
        (
            s,
            s,
            random.uniform(
                0.85,
                1.25,
            ),
        ),
        random.uniform(
            0.0,
            2.0 * math.pi,
        ),
    )


# ------------------------------------------------------------
# Lake tree line
# ------------------------------------------------------------

for index in range(28):
    angle = math.radians(
        random.uniform(
            15.0,
            170.0,
        )
    )

    x = (
        LAKE_CENTER.x
        + (
            LAKE_RX
            + random.uniform(
                35.0,
                70.0,
            )
        )
        * math.cos(angle)
    )

    y = (
        LAKE_CENTER.y
        + (
            LAKE_RY
            + random.uniform(
                24.0,
                55.0,
            )
        )
        * math.sin(angle)
    )

    z = terrain_height(x, y)

    s = random.uniform(
        0.95,
        1.55,
    )

    collection_instance(
        f"UGMRT_LakeTree_{index:02d}",
        tree_proto_col,
        (x, y, z),
        (s, s, s),
        random.uniform(
            0,
            2.0 * math.pi,
        ),
    )



# ------------------------------------------------------------
# V5.4 DISTANT TREE BELT
# ------------------------------------------------------------
# A restrained irregular belt near the horizon breaks the ruler-straight
# ground/sky boundary without surrounding the open antenna field.
# Uses the existing low-poly tree prototype and collection instances.
# ------------------------------------------------------------

tree_belt_rng = random.Random(
    SEED + 540
)

for index in range(42):
    angle = math.radians(
        tree_belt_rng.uniform(
            18.0,
            165.0,
        )
    )

    radius = tree_belt_rng.uniform(
        760.0,
        930.0,
    )

    x = radius * math.cos(angle)
    y = radius * math.sin(angle)

    # Keep the main lake foreground/bank relatively open.
    lake_q = (
        ((x - LAKE_CENTER.x) / (LAKE_RX * 1.15)) ** 2
        + ((y - LAKE_CENTER.y) / (LAKE_RY * 1.15)) ** 2
    )

    if lake_q < 1.10:
        continue

    z = terrain_height(
        x,
        y,
    )

    s = tree_belt_rng.uniform(
        1.05,
        1.65,
    )

    collection_instance(
        f"UGMRT_HorizonTree_{index:02d}",
        tree_proto_col,
        (x, y, z),
        (
            s,
            s,
            tree_belt_rng.uniform(
                1.0,
                1.35,
            ),
        ),
        tree_belt_rng.uniform(
            0.0,
            2.0 * math.pi,
        ),
    )



# ------------------------------------------------------------
# V5.6 FINAL DRY-FIELD DECISION
# ------------------------------------------------------------
# The V5.5 grass prototype executed successfully but was effectively invisible
# at the intended uGMRT viewing scales. It added geometry without meaningful
# visual value. For the current web-bound release we deliberately remove that
# ineffective detail and let the corrected spatial ground shader carry the
# dry-field variation.
# ------------------------------------------------------------

placed_grass = 0


# ------------------------------------------------------------
# Shrubs
# ------------------------------------------------------------

for index in range(220):
    x = random.uniform(
        -880.0,
        880.0,
    )

    y = random.uniform(
        -840.0,
        840.0,
    )

    lake_q = (
        (
            (x - LAKE_CENTER.x)
            / LAKE_RX
        ) ** 2
        +
        (
            (y - LAKE_CENTER.y)
            / LAKE_RY
        ) ** 2
    )

    if lake_q < 1.12:
        continue

    if math.hypot(x, y) < 130.0:
        continue

    z = terrain_height(x, y)

    s = random.uniform(
        0.40,
        1.15,
    )

    collection_instance(
        f"UGMRT_Shrub_{index:03d}",
        shrub_proto_col,
        (x, y, z),
        (
            s,
            s,
            random.uniform(
                0.65,
                1.10,
            ),
        ),
        random.uniform(
            0,
            2.0 * math.pi,
        ),
    )


# ------------------------------------------------------------
# Small tree groups (denser toward the far boundary)
# Review asked for vegetation hierarchy rather than flat random
# scatter — a handful of tight 3-5 tree clusters read as real
# tree lines/groves, unlike single scattered trees.
# ------------------------------------------------------------

cluster_centers = []

for cluster_index in range(11):
    cluster_angle = random.uniform(
        0.0, 2.0 * math.pi
    )

    cluster_radius = random.uniform(
        700.0, 940.0
    )

    cx = cluster_radius * math.cos(cluster_angle)
    cy = cluster_radius * math.sin(cluster_angle)

    lake_q = (
        ((cx - LAKE_CENTER.x) / LAKE_RX) ** 2
        + ((cy - LAKE_CENTER.y) / LAKE_RY) ** 2
    )

    if lake_q < 1.3:
        continue

    cluster_centers.append((cx, cy))

tree_index = 0

for cluster_center in cluster_centers:
    cx, cy = cluster_center

    tree_count = random.randint(3, 5)

    for member in range(tree_count):
        offset_angle = random.uniform(
            0.0, 2.0 * math.pi
        )

        offset_radius = random.uniform(3.0, 14.0)

        x = cx + offset_radius * math.cos(offset_angle)
        y = cy + offset_radius * math.sin(offset_angle)

        z = terrain_height(x, y)

        s = random.uniform(1.00, 1.60)

        collection_instance(
            f"UGMRT_TreeCluster_{tree_index:03d}",
            tree_proto_col,
            (x, y, z),
            (
                s,
                s,
                random.uniform(0.85, 1.30),
            ),
            random.uniform(0.0, 2.0 * math.pi),
        )

        tree_index += 1


# ============================================================
# MASTER ANTENNA
# ============================================================

master_root = bpy.data.objects.new(
    "UGMRT_MASTER_45M",
    None,
)

master_col.objects.link(master_root)

master_root.empty_display_type = (
    "PLAIN_AXES"
)

master_root["facility"] = (
    "upgraded Giant Metrewave Radio Telescope"
)

master_root["diameter_m"] = 45.0
master_root["reference_driven"] = True
master_root["survey_grade"] = False


# ------------------------------------------------------------
# Pedestal
# ------------------------------------------------------------

add_cone(
    "UGMRT_Pedestal",
    3.75,
    2.65,
    10.8,
    (0, 0, 5.4),
    MAT_CONCRETE,
    master_col,
    vertices=36,
    parent=master_root,
)

add_cylinder(
    "UGMRT_Pedestal_Base",
    4.55,
    0.70,
    (0, 0, 0.35),
    MAT_CONCRETE,
    master_col,
    vertices=48,
    parent=master_root,
)

add_cylinder(
    "UGMRT_Azimuth_Ring",
    3.25,
    0.80,
    (0, 0, 11.15),
    MAT_DARK,
    master_col,
    vertices=48,
    parent=master_root,
)

add_cylinder(
    "UGMRT_Service_Platform",
    4.25,
    0.30,
    (0, 0, 11.75),
    MAT_STEEL,
    master_col,
    vertices=48,
    parent=master_root,
)


# ------------------------------------------------------------
# Guard rail
# ------------------------------------------------------------

rail_radius = 4.10

for index in range(16):
    angle1 = (
        2.0
        * math.pi
        * index
        / 16.0
    )

    angle2 = (
        2.0
        * math.pi
        * (index + 1)
        / 16.0
    )

    p1 = (
        rail_radius * math.cos(angle1),
        rail_radius * math.sin(angle1),
        12.75,
    )

    p2 = (
        rail_radius * math.cos(angle2),
        rail_radius * math.sin(angle2),
        12.75,
    )

    add_beam(
        f"UGMRT_Rail_{index:02d}",
        p1,
        p2,
        0.045,
        MAT_STEEL,
        master_col,
        parent=master_root,
        vertices=6,
    )

    if index % 2 == 0:
        add_beam(
            f"UGMRT_RailPost_{index:02d}",
            (
                p1[0],
                p1[1],
                11.90,
            ),
            p1,
            0.055,
            MAT_STEEL,
            master_col,
            parent=master_root,
            vertices=6,
        )


add_cone(
    "UGMRT_Upper_Mount",
    2.70,
    1.60,
    5.0,
    (0, 0, 14.65),
    MAT_WHITE,
    master_col,
    vertices=24,
    parent=master_root,
)

add_cube(
    "UGMRT_Elevation_House",
    (0, 0, 17.0),
    (2.45, 1.60, 1.20),
    MAT_WHITE,
    master_col,
    parent=master_root,
)


# ============================================================
# MOVING HEAD
# ============================================================

head = bpy.data.objects.new(
    "UGMRT_MOVING_HEAD",
    None,
)

master_col.objects.link(head)

head.parent = master_root

head.location = (
    0.0,
    0.0,
    PIVOT_HEIGHT,
)

head.rotation_euler.y = math.radians(
    DISH_ELEVATION_DEG
)


# ============================================================
# REFLECTOR
# ============================================================

RINGS = 20
SEGMENTS = 96


def dish_z(radius):
    return (
        DISH_DEPTH
        * (radius / DISH_RADIUS) ** 2
    )


reflector_vertices = [
    (0.0, 0.0, 0.0)
]

reflector_faces = []

for ring in range(
    1,
    RINGS + 1,
):
    radius = (
        DISH_RADIUS
        * ring
        / RINGS
    )

    z = dish_z(radius)

    for segment in range(
        SEGMENTS
    ):
        angle = (
            2.0
            * math.pi
            * segment
            / SEGMENTS
        )

        reflector_vertices.append(
            (
                radius
                * math.cos(angle),

                radius
                * math.sin(angle),

                z,
            )
        )


for segment in range(SEGMENTS):
    reflector_faces.append(
        (
            0,
            1 + segment,
            1 + (
                (segment + 1)
                % SEGMENTS
            ),
        )
    )


for ring in range(
    1,
    RINGS,
):
    current_start = (
        1
        + (ring - 1)
        * SEGMENTS
    )

    next_start = (
        1
        + ring
        * SEGMENTS
    )

    for segment in range(
        SEGMENTS
    ):
        next_segment = (
            segment + 1
        ) % SEGMENTS

        reflector_faces.append(
            (
                current_start + segment,
                next_start + segment,
                next_start + next_segment,
                current_start + next_segment,
            )
        )


reflector_mesh = bpy.data.meshes.new(
    "UGMRT_Reflector_Surface_Mesh"
)

reflector_mesh.from_pydata(
    reflector_vertices,
    [],
    reflector_faces,
)

reflector_mesh.update()

dish = bpy.data.objects.new(
    "UGMRT_45m_Mesh_Reflector",
    reflector_mesh,
)

master_col.objects.link(dish)

dish.parent = head

reflector_mesh.materials.append(
    MAT_MESH
)

# Flat shading (not smooth) — real GMRT dishes read as a jointed
# panel/mesh net with visible facet edges, not a continuous smooth
# reflector surface.
for polygon in reflector_mesh.polygons:
    polygon.use_smooth = False


# ============================================================
# RADIAL RIBS
# ============================================================

for index in range(24):
    angle = (
        2.0
        * math.pi
        * index
        / 24.0
    )

    points = []

    for step in range(13):
        radius = (
            DISH_RADIUS
            * step
            / 12.0
        )

        points.append(
            (
                radius * math.cos(angle),
                radius * math.sin(angle),
                dish_z(radius) + 0.09,
            )
        )

    add_curve(
        f"UGMRT_RadialRib_{index:02d}",
        points,
        0.055,
        MAT_STEEL,
        master_col,
        parent=head,
    )


# ============================================================
# CIRCUMFERENTIAL RIBS
# ============================================================

for index, fraction in enumerate(
    (
        0.14,
        0.24,
        0.34,
        0.44,
        0.54,
        0.64,
        0.74,
        0.84,
        0.92,
    )
):
    radius = (
        DISH_RADIUS
        * fraction
    )

    z = dish_z(radius) + 0.10

    points = []

    for segment in range(72):
        angle = (
            2.0
            * math.pi
            * segment
            / 72.0
        )

        points.append(
            (
                radius
                * math.cos(angle),

                radius
                * math.sin(angle),

                z,
            )
        )

    add_curve(
        f"UGMRT_RingRib_{index:02d}",
        points,
        0.048,
        MAT_STEEL,
        master_col,
        cyclic=True,
        parent=head,
    )


# ============================================================
# RIM TRUSS
# ============================================================

RIM_SEGMENTS = 32

outer_radius = DISH_RADIUS
inner_radius = DISH_RADIUS - 1.35

outer_z = dish_z(outer_radius)

inner_z = (
    dish_z(inner_radius) - 0.25
)

for index in range(RIM_SEGMENTS):
    angle1 = (
        2.0
        * math.pi
        * index
        / RIM_SEGMENTS
    )

    angle2 = (
        2.0
        * math.pi
        * (index + 1)
        / RIM_SEGMENTS
    )

    outer_a = (
        outer_radius * math.cos(angle1),
        outer_radius * math.sin(angle1),
        outer_z,
    )

    outer_b = (
        outer_radius * math.cos(angle2),
        outer_radius * math.sin(angle2),
        outer_z,
    )

    inner_a = (
        inner_radius * math.cos(angle1),
        inner_radius * math.sin(angle1),
        inner_z,
    )

    inner_b = (
        inner_radius * math.cos(angle2),
        inner_radius * math.sin(angle2),
        inner_z,
    )

    add_beam(
        f"UGMRT_RimOuter_{index:02d}",
        outer_a,
        outer_b,
        0.095,
        MAT_STEEL,
        master_col,
        parent=head,
    )

    add_beam(
        f"UGMRT_RimInner_{index:02d}",
        inner_a,
        inner_b,
        0.080,
        MAT_STEEL,
        master_col,
        parent=head,
    )

    add_beam(
        f"UGMRT_RimDiagA_{index:02d}",
        outer_a,
        inner_b,
        0.055,
        MAT_STEEL,
        master_col,
        parent=head,
    )

    if index % 2 == 0:
        add_beam(
            f"UGMRT_RimDiagB_{index:02d}",
            inner_a,
            outer_b,
            0.050,
            MAT_STEEL,
            master_col,
            parent=head,
        )


# ============================================================
# REAR HUB / SUPPORT
# ============================================================

add_cylinder(
    "UGMRT_Rear_Hub",
    1.55,
    2.20,
    (0, 0, -2.0),
    MAT_DARK,
    master_col,
    vertices=24,
    parent=head,
)

for index in range(12):
    angle = (
        2.0
        * math.pi
        * index
        / 12.0
    )

    radius = (
        DISH_RADIUS
        * 0.72
    )

    add_beam(
        f"UGMRT_RearSpoke_{index:02d}",
        (0, 0, -2.0),
        (
            radius * math.cos(angle),
            radius * math.sin(angle),
            dish_z(radius) - 0.10,
        ),
        0.11,
        MAT_STEEL,
        master_col,
        parent=head,
    )


# ============================================================
# FEED SUPPORT
# ============================================================

feed_point = (
    0.0,
    0.0,
    FOCAL_LENGTH,
)

add_cylinder(
    "UGMRT_Feed_Box",
    0.82,
    1.65,
    feed_point,
    MAT_DARK,
    master_col,
    vertices=24,
    parent=head,
)

feed_support_radius = (
    DISH_RADIUS * 0.78
)

for index, degrees in enumerate(
    (
        45,
        135,
        225,
        315,
    )
):
    angle = math.radians(
        degrees
    )

    support_point = (
        feed_support_radius
        * math.cos(angle),

        feed_support_radius
        * math.sin(angle),

        dish_z(
            feed_support_radius
        ),
    )

    add_beam(
        f"UGMRT_FeedBoom_{index:02d}",
        support_point,
        feed_point,
        0.13,
        MAT_STEEL,
        master_col,
        parent=head,
    )


support_apex = (
    0.0,
    0.0,
    FOCAL_LENGTH + 1.3,
)

for index, degrees in enumerate(
    (
        0,
        120,
        240,
    )
):
    angle = math.radians(
        degrees
    )

    radius = (
        DISH_RADIUS * 0.96
    )

    support_point = (
        radius * math.cos(angle),
        radius * math.sin(angle),
        dish_z(radius) - 0.20,
    )

    add_beam(
        f"UGMRT_MainSupport_{index:02d}",
        support_point,
        support_apex,
        0.17,
        MAT_STEEL,
        master_col,
        parent=head,
    )


add_cylinder(
    "UGMRT_Elevation_Axle",
    2.15,
    7.4,
    (0, 0, -0.8),
    MAT_DARK,
    master_col,
    vertices=32,
    rotation=(
        math.radians(90.0),
        0.0,
        0.0,
    ),
    parent=head,
)

add_ico(
    "UGMRT_Red_Beacon",
    support_apex,
    (
        0.28,
        0.28,
        0.28,
    ),
    MAT_RED,
    master_col,
    subdivisions=2,
    parent=head,
)


# ============================================================
# 30-ANTENNA COMPRESSED ARRAY
# ============================================================

central_positions = [
    (0, 0),

    (95, 0),
    (-95, 0),

    (48, 82),
    (-48, 82),

    (48, -82),
    (-48, -82),

    (160, 65),
    (-160, 65),

    (0, 165),
    (0, -165),

    (150, -110),
    (-150, -110),

    (190, 155),
]


ARM_ANGLES = [
    10.0,
    130.0,
    250.0,
]

arm_lengths = [
    (
        280,
        385,
        500,
        620,
        750,
        880,
    ),

    (
        300,
        420,
        550,
        690,
        830,
    ),

    (
        310,
        440,
        570,
        710,
        860,
    ),
]

arm_positions = []

for degrees, lengths in zip(
    ARM_ANGLES,
    arm_lengths,
):
    angle = math.radians(
        degrees
    )

    perpendicular = Vector(
        (
            -math.sin(angle),
            math.cos(angle),
        )
    )

    offsets = [
        0,
        12,
        -10,
        14,
        -12,
        8,
    ]

    for index, radius in enumerate(
        lengths
    ):
        offset = offsets[index]

        x = (
            radius * math.cos(angle)
            + perpendicular.x * offset
        )

        y = (
            radius * math.sin(angle)
            + perpendicular.y * offset
        )

        arm_positions.append(
            (x, y)
        )


antenna_positions = (
    central_positions
    + arm_positions
)

assert len(
    antenna_positions
) == 30


fence_target_positions = []

# Real final antenna coordinates, keyed by index — cameras placed
# later (hero/road shots) read from this instead of guessing
# coordinates in a different space, which is what put the road-side
# camera 150m+ from the nearest actual dish last pass.
antenna_final_positions = {}


def central_expansion_scale(raw_radius):
    if raw_radius <= EXPANSION_INNER_RADIUS:
        return CENTRAL_EXPANSION

    if raw_radius >= EXPANSION_OUTER_RADIUS:
        return 1.0

    t = (
        (raw_radius - EXPANSION_INNER_RADIUS)
        / (EXPANSION_OUTER_RADIUS - EXPANSION_INNER_RADIUS)
    )

    t = t * t * (3.0 - 2.0 * t)

    return (
        CENTRAL_EXPANSION
        + (1.0 - CENTRAL_EXPANSION) * t
    )


# Separate seeded generator so this jitter pass doesn't shift the
# random sequence consumed later by vegetation/hill placement.
position_jitter_rng = random.Random(
    POSITION_JITTER_SEED
)

for index, (x, y) in enumerate(
    antenna_positions
):
    raw_radius = math.hypot(x, y)

    local_scale = central_expansion_scale(
        raw_radius
    )

    x *= local_scale
    y *= local_scale

    # Subtle positional deviation only — arm direction/intent is
    # preserved, this just breaks the "ruler-straight line" look
    # the review flagged. Skipped for the exact center antenna.
    if index > 0:
        jitter_magnitude = (
            position_jitter_rng.uniform(2.0, 5.0)
            + raw_radius * 0.004
        )

        jitter_angle = position_jitter_rng.uniform(
            0.0, 2.0 * math.pi
        )

        x += jitter_magnitude * math.cos(jitter_angle)
        y += jitter_magnitude * math.sin(jitter_angle)

    x *= ARRAY_SCALE
    y *= ARRAY_SCALE

    z = (
        terrain_height(x, y)
        + 0.15
    )

    # Reference photo 2 (water-reflection shot) shows a low perimeter
    # fence around at least the near antenna's pad. Fencing every one
    # of the 30 antennas would add real polycount for a detail that
    # reads clearly on only the handful nearest the QA hero cameras —
    # same web-performance-discipline principle used for DOT/HCT — so
    # only the central cluster (closest to camera) gets a fence.
    if index < 6:
        fence_target_positions.append(
            (x, y)
        )

    antenna_final_positions[index] = (
        x, y, z
    )

    instance = bpy.data.objects.new(
        f"UGMRT_Antenna_{index + 1:02d}",
        None,
    )

    instance.instance_type = (
        "COLLECTION"
    )

    instance.instance_collection = (
        master_col
    )

    instance.location = (
        x,
        y,
        z,
    )

    instance.rotation_euler.z = (
        math.radians(
            ARRAY_AZIMUTH_DEG
        )
    )

    array_col.objects.link(instance)


# ============================================================
# ANTENNA PAD PERIMETER FENCE
# (reference photo: water-reflection shot shows a low chain-link
# fence around the near antenna's maintenance pad)
# ============================================================

MAT_FENCE_WIRE = make_material(
    "UGMRT_Fence_Wire",
    (0.42, 0.43, 0.41),
    metallic=0.35,
    roughness=0.55,
)

MAT_FENCE_POST = make_material(
    "UGMRT_Fence_Post",
    (0.30, 0.31, 0.29),
    metallic=0.25,
    roughness=0.60,
)


def add_perimeter_fence(
    name,
    center,
    radius=7.2,
    posts=16,
    height=1.55,
):
    cx, cy = center
    cz = terrain_height(cx, cy)

    post_points = []

    for index in range(posts):
        angle = (
            2.0
            * math.pi
            * index
            / posts
        )

        px = cx + radius * math.cos(angle)
        py = cy + radius * math.sin(angle)
        pz = terrain_height(px, py)

        post_points.append(
            (px, py, pz)
        )

        add_beam(
            f"{name}_Post_{index:02d}",
            (px, py, pz),
            (px, py, pz + height),
            0.035,
            MAT_FENCE_POST,
            env_col,
            vertices=6,
        )

    top_ring = [
        (
            point[0],
            point[1],
            point[2] + height,
        )
        for point in post_points
    ]

    mid_ring = [
        (
            point[0],
            point[1],
            point[2] + height * 0.55,
        )
        for point in post_points
    ]

    add_curve(
        f"{name}_TopWire",
        top_ring,
        0.018,
        MAT_FENCE_WIRE,
        env_col,
        cyclic=True,
    )

    add_curve(
        f"{name}_MidWire",
        mid_ring,
        0.018,
        MAT_FENCE_WIRE,
        env_col,
        cyclic=True,
    )


for index, (fx, fy) in enumerate(
    fence_target_positions
):
    add_perimeter_fence(
        f"UGMRT_PadFence_{index:02d}",
        (fx, fy),
    )


# ============================================================
# POLYTUNNEL / GREENHOUSE STRUCTURES
# (reference photo 1 shows a poly-house greenhouse directly beside
# an antenna — the real uGMRT site sits among active farmland)
# ============================================================

MAT_POLYTUNNEL_FILM = make_material(
    "UGMRT_Polytunnel_Film",
    (0.72, 0.78, 0.70),
    metallic=0.0,
    roughness=0.30,
    alpha=0.42,
)

try:
    MAT_POLYTUNNEL_FILM.blend_method = "BLEND"
except Exception:
    pass

MAT_POLYTUNNEL_FRAME = make_material(
    "UGMRT_Polytunnel_Frame",
    (0.55, 0.52, 0.45),
    metallic=0.15,
    roughness=0.65,
)


def add_polytunnel(
    name,
    center,
    length=26.0,
    width=7.5,
    arch_height=3.2,
    rotation_z=0.0,
    ribs=9,
):
    cx, cy = center
    base_z = terrain_height(cx, cy)

    cos_r = math.cos(rotation_z)
    sin_r = math.sin(rotation_z)

    def to_world(local_x, local_y):
        return (
            cx
            + local_x * cos_r
            - local_y * sin_r,
            cy
            + local_x * sin_r
            + local_y * cos_r,
        )

    arch_points_local = []
    steps = 10

    for step in range(steps + 1):
        t = step / steps
        arch_angle = math.pi * t

        local_y = -(width * 0.5) * math.cos(
            arch_angle
        )

        local_z = arch_height * math.sin(
            arch_angle
        )

        arch_points_local.append(
            (local_y, local_z)
        )

    for rib_index in range(ribs):
        local_x = (
            -length * 0.5
            + length * rib_index / (ribs - 1)
        )

        rib_points = []

        for local_y, local_z in arch_points_local:
            wx, wy = to_world(
                local_x, local_y
            )

            rib_points.append(
                (
                    wx,
                    wy,
                    base_z + local_z,
                )
            )

        add_curve(
            f"{name}_Rib_{rib_index:02d}",
            rib_points,
            0.035,
            MAT_POLYTUNNEL_FRAME,
            env_col,
        )

    skin_verts = []
    skin_faces = []

    for rib_index in range(ribs):
        local_x = (
            -length * 0.5
            + length * rib_index / (ribs - 1)
        )

        for local_y, local_z in arch_points_local:
            wx, wy = to_world(
                local_x, local_y
            )

            skin_verts.append(
                (
                    wx,
                    wy,
                    base_z + local_z + 0.02,
                )
            )

    row_len = len(arch_points_local)

    for rib_index in range(ribs - 1):
        for point_index in range(row_len - 1):
            a = rib_index * row_len + point_index
            b = a + 1
            c = a + row_len + 1
            d = a + row_len

            skin_faces.append(
                (a, b, c, d)
            )

    skin_mesh = bpy.data.meshes.new(
        name + "_Skin_Mesh"
    )

    skin_mesh.from_pydata(
        skin_verts,
        [],
        skin_faces,
    )

    skin_mesh.update()

    skin_obj = bpy.data.objects.new(
        name + "_Skin",
        skin_mesh,
    )

    env_col.objects.link(skin_obj)
    skin_mesh.materials.append(
        MAT_POLYTUNNEL_FILM
    )

    for polygon in skin_mesh.polygons:
        polygon.use_smooth = True


polytunnel_specs = [
    ((-360, -455), 24.0, math.radians(12.0)),
    ((610, 310), 30.0, math.radians(-20.0)),
]

for index, (
    center,
    length,
    rotation_z,
) in enumerate(polytunnel_specs):
    add_polytunnel(
        f"UGMRT_Polytunnel_{index:02d}",
        center,
        length=length,
        rotation_z=rotation_z,
    )


# ============================================================
# ARM TRACKS — V5.1 CORRECTION
# ============================================================
# The previous revision drew three long Y-shaped service ribbons from
# the array centre. In QA they read as diagram lines rather than real
# observatory roads. Keep the already-built main asphalt road and its
# three feeder/access branches above; do not add redundant arm-wide
# ribbons in this correction pass.


# ============================================================
# CLEAR BLUE SKY
# ============================================================

world = bpy.context.scene.world

if world is None:
    world = bpy.data.worlds.new(
        "UGMRT_Clear_Sky"
    )

    bpy.context.scene.world = (
        world
    )

world.use_nodes = True

nodes = world.node_tree.nodes
links = world.node_tree.links

for node in list(nodes):
    nodes.remove(node)

output = nodes.new(
    "ShaderNodeOutputWorld"
)

background = nodes.new(
    "ShaderNodeBackground"
)

sky = nodes.new(
    "ShaderNodeTexSky"
)

sky.sky_type = "NISHITA"

try:
    sky.sun_elevation = math.radians(
        38.0
    )

    sky.sun_rotation = math.radians(
        118.0
    )

    sky.altitude = 650.0
    sky.air_density = 1.00
    sky.dust_density = 0.28
    sky.ozone_density = 1.00

except Exception:
    pass

background.inputs[
    "Strength"
].default_value = 0.40

links.new(
    sky.outputs["Color"],
    background.inputs["Color"],
)

links.new(
    background.outputs["Background"],
    output.inputs["Surface"],
)


# ============================================================
# SUN
# ============================================================

bpy.ops.object.light_add(
    type="SUN",
    location=(
        0,
        0,
        500,
    ),
)

sun = bpy.context.object
sun.name = "UGMRT_Clear_Day_Sun"

sun.rotation_euler = (
    math.radians(32.0),
    math.radians(-24.0),
    math.radians(128.0),
)

sun.data.energy = 1.25
sun.data.angle = math.radians(
    5.0
)

relink(
    sun,
    env_col,
)


# ============================================================
# CAMERAS
# ============================================================

def add_camera(
    name,
    location,
    target,
    lens,
):
    bpy.ops.object.camera_add(
        location=location
    )

    camera = bpy.context.object
    camera.name = name
    camera.data.lens = lens
    camera.data.clip_end = 4000.0

    direction = (
        Vector(target)
        - camera.location
    )

    camera.rotation_euler = (
        direction.to_track_quat(
            "-Z",
            "Y",
        ).to_euler()
    )

    relink(
        camera,
        cam_col,
    )

    return camera


overview_camera = add_camera(
    "UGMRT_QA_Full_Array_Overview",
    (
        560,
        -650,
        360,
    ),
    (
        0,
        0,
        20,
    ),
    50,
)


lake_camera = add_camera(
    "UGMRT_QA_Lake_Hero",
    (
        640,
        -510,
        50,
    ),
    (
        90,
        -430,
        18,
    ),
    50,
)


# Genuinely low, human/drone-height environmental camera — the
# previous "cinematic" camera (z=40, centered/symmetrical) read as
# a drone looking down at a model rather than standing in the site.
env_low_camera = add_camera(
    "UGMRT_QA_Environmental_Low",
    (
        -70,
        -210,
        5.5,
    ),
    (
        160,
        90,
        20,
    ),
    45,
)


# Hero antenna composition — one dominant foreground dish with
# medium dishes behind it and small distant ones beyond, per the
# review's single-antenna reference photos. Built from the antenna's
# REAL final coordinates (antenna index 1, the east-facing central
# dish) — a hand-guessed camera position was the bug last pass: it
# ended up 150m+ from the nearest actual dish.
hero_dish_x, hero_dish_y, hero_dish_z = (
    antenna_final_positions[1]
)

hero_antenna_camera = add_camera(
    "UGMRT_QA_Hero_Antenna",
    (
        hero_dish_x - 36.0,
        hero_dish_y - 13.0,
        2.8,
    ),
    (
        hero_dish_x,
        hero_dish_y,
        16.0,
    ),
    40,
)


# Low road-side shot — narrow paved road beside a huge antenna,
# matching the single-antenna-near-road reference photo. Aimed at
# antenna index 12, which the south lakeside feeder road was
# rerouted to actually pass beside (same fix as above).
road_dish_x, road_dish_y, road_dish_z = (
    antenna_final_positions[12]
)

road_hero_camera = add_camera(
    "UGMRT_QA_Road_Side_Hero",
    (
        road_dish_x - 58.0,
        road_dish_y - 17.0,
        3.2,
    ),
    (
        road_dish_x,
        road_dish_y,
        17.0,
    ),
    48,
)


bpy.context.scene.camera = (
    overview_camera
)


# ============================================================
# RENDER SETTINGS
# ============================================================

scene = bpy.context.scene

scene.render.engine = (
    "BLENDER_EEVEE_NEXT"
)

scene.render.resolution_x = 1600
scene.render.resolution_y = 1000

scene.render.resolution_percentage = (
    100
)

scene.render.image_settings.file_format = (
    "PNG"
)

scene.render.film_transparent = False

try:
    scene.view_settings.view_transform = (
        "AgX"
    )
except Exception:
    pass

try:
    scene.view_settings.look = (
        "AgX - Medium High Contrast"
    )
except Exception:
    try:
        scene.view_settings.look = (
            "AgX - Medium Contrast"
        )
    except Exception:
        pass

# Explicit deterministic exposure. The previous file inherited the
# Blender file's exposure state while simultaneously using a strong
# Nishita world and a 2.5-energy Sun, producing the washed-out cream
# terrain seen in QA. Keep the sky bright but bring scene luminance
# back into a natural daylight range.
try:
    scene.view_settings.exposure = -0.78
    scene.view_settings.gamma = 1.0
except Exception:
    pass

# Make Material Preview / Rendered View use this script's world and
# lights whenever possible. This prevents Blender's studio HDRI from
# making the viewport look unrelated to the actual saved scene.
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type != "VIEW_3D":
            continue
        try:
            shading = area.spaces.active.shading
            shading.use_scene_world = True
            shading.use_scene_lights = True
        except Exception:
            pass


# ============================================================
# METADATA
# ============================================================

scene[
    "UGMRT_SCRIPT_SIGNATURE"
] = SCRIPT_SIGNATURE

scene[
    "UGMRT_ANTENNA_COUNT"
] = 30

scene[
    "UGMRT_ARRAY_SCALE"
] = ARRAY_SCALE

scene[
    "UGMRT_EXACT_COORDINATES"
] = False

scene[
    "UGMRT_ENVIRONMENT_V3"
] = (
    "compressed array + open dry fields + "
    "irregular crop patches + lake + shoreline + "
    "smooth roads + sparse vegetation + low hills + blue sky"
)

scene[
    "UGMRT_ENVIRONMENT_V4"
] = (
    "open-net flat-shaded reflector (was frosted solid disc) + "
    "matte painted-white structure (was gunmetal steel) + "
    "pale weathered concrete pedestal (was dark gray) + "
    "near-cluster perimeter fences + 2 polytunnel greenhouses"
)

scene[
    "UGMRT_ENVIRONMENT_V5"
] = (
    "smooth-shaded terrain + shared-vertex horizon skirt + ~25pct "
    "central expansion + reduced arm jitter + low-contrast irregular "
    "field patches + enlarged lake/shoreline + coherent main road and "
    "feeders + continuous hill ridge + clustered vegetation + corrected "
    "daylight exposure/sky + preserved low/hero/road-side camera suite"
)

scene[
    "UGMRT_ENVIRONMENT_V5_1"
] = (
    "visual correction only: world 0.40 + sun 1.25 + AgX exposure -0.70; "
    "darker horizon bands; gentler horizon drop; reduced array jitter; "
    "removed redundant Y-shaped diagram tracks; preserved accepted "
    "antenna geometry, core layout concept, lake, vegetation and cameras"
)



scene[
    "UGMRT_ENVIRONMENT_V5_2"
] = (
    "environment polish: coherent lake basin/water surface + softer "
    "field overlays + procedural macro ground variation + more visible "
    "low horizon ridges + stronger vegetation scale hierarchy + gently "
    "curved main road + refined road-side hero framing + denser open "
    "reflector mesh while preserving accepted array and antenna geometry"
)


scene[
    "UGMRT_ENVIRONMENT_V5_3"
] = (
    "lake-only correction: removed erroneous filled shoreline fan and "
    "replaced it with one continuous water mesh plus a narrow true "
    "shoreline ring; accepted antenna geometry, 30-array layout, terrain, "
    "roads, vegetation, hills, lighting and camera systems preserved"
)


scene[
    "UGMRT_ENVIRONMENT_V5_4"
] = (
    "terrain+horizon polish only: deeper dry-field palette + stronger "
    "low-frequency ground variation + slightly broader gentle terrain "
    "undulation + softer horizon skirt fall + more visible existing low "
    "ridge ring + lightweight irregular distant tree belt; accepted lake, "
    "antenna geometry, 30-array layout, roads, lighting and cameras preserved"
)



# ------------------------------------------------------------
# V5.5 FINAL DISTANT VEGETATION CLUSTERS
# ------------------------------------------------------------
# Only a few small groups, concentrated toward the distant field/lake
# environment. Existing vegetation remains untouched.
# ------------------------------------------------------------

final_tree_rng = random.Random(
    SEED + 551
)

final_cluster_centres = [
    (-520.0, 610.0),
    (-255.0, 735.0),
    (180.0, 760.0),
    (500.0, 620.0),
]

final_tree_index = 0

for cx, cy in final_cluster_centres:
    for _ in range(
        final_tree_rng.randint(4, 7)
    ):
        x = cx + final_tree_rng.uniform(
            -42.0,
            42.0,
        )
        y = cy + final_tree_rng.uniform(
            -26.0,
            26.0,
        )

        lake_q = (
            ((x - LAKE_CENTER.x) / (LAKE_RX * 1.04)) ** 2
            + ((y - LAKE_CENTER.y) / (LAKE_RY * 1.04)) ** 2
        )

        if lake_q < 1.0:
            continue

        z = terrain_height(
            x,
            y,
        )

        sc = final_tree_rng.uniform(
            0.82,
            1.32,
        )

        collection_instance(
            f"UGMRT_FinalTree_{final_tree_index:02d}",
            tree_proto_col,
            (x, y, z),
            (
                sc,
                sc,
                sc * final_tree_rng.uniform(
                    0.95,
                    1.22,
                ),
            ),
            final_tree_rng.uniform(
                0.0,
                2.0 * math.pi,
            ),
        )

        final_tree_index += 1


scene[
    "UGMRT_ENVIRONMENT_V5_6"
] = (
    "FINAL ENVIRONMENT POLISH CANDIDATE: accepted 30-antenna geometry/layout, "
    "lake, terrain geometry, horizon architecture, sky, sun, roads geometry and "
    "camera systems preserved; main terrain now uses position-driven broad "
    "macro colour variation; field overlays are muted into the earth palette; "
    "service tracks are darker/desaturated; ineffective V5.5 dry-grass geometry "
    "removed to avoid export cost without visible value; distant vegetation "
    "hierarchy retained."
)


# ============================================================
# SAVE
# ============================================================

# Fixed, non-accumulating absolute path — the previous version
# derived this relative to __file__, which is unreliable when the
# script runs as a Blender Text Editor block rather than a real
# script from disk, and was compounding one extra "blender" folder
# deeper on every re-run (ended up 6 levels deep, past Windows'
# path-length limit). This matches the same fixed-path convention
# already used for the DOT and HCT authoring files.
blend_directory = (
    r"E:\Diya Portfolio Website\02 - Production"
    r"\diya-astrophysics-portfolio-production"
    r"\diya-astrophysics-portfolio-production"
    r"\asset-preparation\observatories"
    r"\3d-production\ugmrt\blender"
)

os.makedirs(
    blend_directory,
    exist_ok=True,
)

blend_path = os.path.join(
    blend_directory,
    "ugmrt-facility-hybrid-v1.blend",
)

try:
    bpy.ops.wm.save_as_mainfile(
        filepath=blend_path
    )
except Exception as save_error:
    print(
        "SAVE FAILED — scene is still built in this "
        "session, just not written to disk:",
        save_error,
    )


print("")
print("============================================================")
print("DIYA ASTRA — uGMRT V5.6 FINAL ENVIRONMENT POLISH BUILT")
print("============================================================")
print("Signature       :", SCRIPT_SIGNATURE)
print("Antennas        :", len(antenna_positions))
print("Array scale     :", ARRAY_SCALE)
print("Central expansion (radial taper)  :", CENTRAL_EXPANSION)
print("Antenna position jitter           : YES")
print("Smooth-shaded terrain              : YES")
print("Horizon skirt bands                :", len(HORIZON_BAND_DEPTHS))
print("Softened irregular field patches   : YES")
print("Rebuilt/relocated lake + shoreline : YES")
print("Connected 3-branch road hierarchy  : YES")
print("Continuous horizon hill ridge      :", len(hill_specs))
print("Enlarged + clustered vegetation    : YES")
print("Open-net reflector (flat-shaded, low-alpha): YES")
print("Matte white structure (destination steel)  : YES")
print("Pale weathered pedestal concrete            : YES")
print("Near-cluster perimeter fences               :", len(fence_target_positions))
print("Polytunnel greenhouses                      :", len(polytunnel_specs))
print("Corrected hazy blue sky (was near-black)    : YES")
print("World strength / Sun energy               : 0.40 / 1.25")
print("AgX exposure                               : -0.70 EV")
print("Redundant Y-shaped arm tracks              : REMOVED")
print("Overview camera        : YES")
print("Lake hero camera        : YES")
print("Environmental low camera: YES")
print("Hero antenna camera     : YES")
print("Road-side hero camera   : YES")
print("Blender master  :", blend_path)
print("Ground macro coordinates                 : GEOMETRY POSITION")
print("Ground macro noise scale                 : 0.0060")
print("Service-track palette                    : DARK / MUTED EARTH")
print("Ineffective V5.5 dry-grass instances     :", placed_grass)
print("STATUS          : V5.6 FINAL VISUAL QA REQUIRED — ACCEPT OR STOP CURRENT-RELEASE AUTHORING")
print("============================================================")