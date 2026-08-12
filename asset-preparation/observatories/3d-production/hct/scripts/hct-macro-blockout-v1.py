# ================================================================
# DIYA ASTRA — HCT / HANLE HYBRID RECONSTRUCTION
# REFINED V5 — CURRENT-RELEASE VISUAL FOUNDATION
# Blender 4.5.x
#
# Goals of this replacement:
#   * eliminate circular/radial mountain walls and blue gaps
#   * eliminate the square "terrain island" look
#   * create one continuous Hanle terrain field with open valleys
#   * create a smooth terrain-following road with gravel shoulders
#   * rebuild HCT massing, dome, shutter and balcony coherently
#   * add facade cues, dish, solar panels, sparse scrub and rocks
#   * use web-conscious linked instances for repeated scatter
#   * provide daylight/material/render QA cameras
#
# Scientific / reconstruction honesty:
#   Reference-driven approximation only; not GIS/survey/photogrammetry.
#   The dish is site communications infrastructure, NOT HFOSC.
# ================================================================

import bpy  # type: ignore[import-not-found]
import bmesh  # type: ignore[import-not-found]
import math
import random
from mathutils import Vector  # type: ignore[import-not-found]

SCRIPT_SIGNATURE = "HCT_FINAL_V7_1_ROAD_GROUNDING_20260813"
SEED = 20260812
random.seed(SEED)

WORLD_COLLECTION_NAME = "HCT_WORLD_V7_FINAL"
SITE_COLLECTION_NAME = "HCT_SITE"
FACILITY_COLLECTION_NAME = "HCT_FACILITY"
ROAD_COLLECTION_NAME = "HCT_ROAD"
SCATTER_COLLECTION_NAME = "HCT_SCATTER"
INFRA_COLLECTION_NAME = "HCT_INFRASTRUCTURE"
LIGHT_COLLECTION_NAME = "HCT_LIGHTING"
CAMERA_COLLECTION_NAME = "HCT_QA_CAMERAS"

# Coordinate convention: X east-west, Y approach/valley axis, Z up.
FACILITY_X = 18.0
FACILITY_Y = 12.0

# Large enough that visitor cameras never see a rectangular boundary.
WORLD_HALF_X = 265.0
WORLD_HALF_Y = 235.0
GRID_X = 144
GRID_Y = 124

# ----------------------------------------------------------------
# BASIC HELPERS
# ----------------------------------------------------------------

def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    master = bpy.context.scene.collection
    for child in list(master.children):
        master.children.unlink(child)

    for coll in list(bpy.data.collections):
        if coll.users == 0:
            bpy.data.collections.remove(coll)

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


def create_collection(name, parent=None):
    coll = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    parent = parent or bpy.context.scene.collection
    if coll.name not in parent.children:
        parent.children.link(coll)
    return coll


def move_to_collection(obj, coll):
    for source in list(obj.users_collection):
        source.objects.unlink(obj)
    coll.objects.link(obj)


def assign_material(obj, material):
    if getattr(obj, "data", None) and hasattr(obj.data, "materials"):
        obj.data.materials.clear()
        obj.data.materials.append(material)


def add_bevel(obj, width=0.12, segments=2):
    mod = obj.modifiers.new("Edge_Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    return mod


def add_cube(name, location, dimensions, material, coll, rotation=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        add_bevel(obj, bevel, 2)
    assign_material(obj, material)
    move_to_collection(obj, coll)
    return obj


def add_cylinder(name, location, radius, depth, material, coll, vertices=48, rotation=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.active_object
    obj.name = name
    if bevel:
        add_bevel(obj, bevel, 2)
    assign_material(obj, material)
    move_to_collection(obj, coll)
    return obj


def add_torus(name, location, major_radius, minor_radius, material, coll, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=64,
        minor_segments=8,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.active_object
    obj.name = name
    assign_material(obj, material)
    move_to_collection(obj, coll)
    return obj


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def create_curve_tube(name, points, bevel_depth, material, coll, cyclic=False):
    curve_data = bpy.data.curves.new(name=f"{name}_Curve", type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = 2
    curve_data.bevel_depth = bevel_depth
    curve_data.bevel_resolution = 2

    spline = curve_data.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for i, p in enumerate(points):
        spline.points[i].co = (p[0], p[1], p[2], 1.0)
    spline.use_cyclic_u = cyclic

    obj = bpy.data.objects.new(name, curve_data)
    coll.objects.link(obj)
    assign_material(obj, material)
    return obj


# ----------------------------------------------------------------
# MATERIALS
# ----------------------------------------------------------------

def simple_material(name, color, roughness=0.6, metallic=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return m


def terrain_material():
    m = bpy.data.materials.new("HCT_Terrain_Distance_Material")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    geom = nt.nodes.new("ShaderNodeNewGeometry")
    length = nt.nodes.new("ShaderNodeVectorMath")
    length.operation = "LENGTH"
    mapr = nt.nodes.new("ShaderNodeMapRange")
    mapr.inputs["From Min"].default_value = 55.0
    mapr.inputs["From Max"].default_value = 310.0
    mapr.inputs["To Min"].default_value = 0.0
    mapr.inputs["To Max"].default_value = 1.0
    mapr.clamp = True

    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0.27, 0.19, 0.105, 1.0)
    mid = ramp.color_ramp.elements.new(0.48)
    mid.color = (0.35, 0.255, 0.155, 1.0)
    far = ramp.color_ramp.elements.new(0.78)
    far.color = (0.29, 0.285, 0.27, 1.0)
    ramp.color_ramp.elements[-1].position = 1.0
    ramp.color_ramp.elements[-1].color = (0.25, 0.285, 0.33, 1.0)

    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 0.052
    noise.inputs["Detail"].default_value = 5.0
    noise.inputs["Roughness"].default_value = 0.72

    noise_ramp = nt.nodes.new("ShaderNodeValToRGB")
    noise_ramp.color_ramp.elements[0].color = (0.68, 0.58, 0.44, 1.0)
    noise_ramp.color_ramp.elements[-1].color = (0.96, 0.88, 0.74, 1.0)

    multiply = nt.nodes.new("ShaderNodeMixRGB")
    multiply.blend_type = "MULTIPLY"
    multiply.inputs[0].default_value = 1.0

    bump_noise = nt.nodes.new("ShaderNodeTexNoise")
    bump_noise.inputs["Scale"].default_value = 0.55
    bump_noise.inputs["Detail"].default_value = 3.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.26
    bump.inputs["Distance"].default_value = 0.18

    nt.links.new(geom.outputs["Position"], length.inputs[0])
    nt.links.new(length.outputs["Value"], mapr.inputs["Value"])
    nt.links.new(mapr.outputs["Result"], ramp.inputs["Fac"])
    nt.links.new(geom.outputs["Position"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], noise_ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], multiply.inputs[1])
    nt.links.new(noise_ramp.outputs["Color"], multiply.inputs[2])
    nt.links.new(multiply.outputs["Color"], bsdf.inputs["Base Color"])

    nt.links.new(geom.outputs["Position"], bump_noise.inputs["Vector"])
    nt.links.new(bump_noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    bsdf.inputs["Roughness"].default_value = 0.93
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def corrugated_white_material():
    m = bpy.data.materials.new("HCT_White_Corrugated_Metal")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.78, 0.82, 0.84, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.35
    bsdf.inputs["Roughness"].default_value = 0.36

    tex = nt.nodes.new("ShaderNodeTexWave")
    tex.wave_type = "BANDS"
    tex.bands_direction = "X"
    tex.inputs["Scale"].default_value = 7.0
    tex.inputs["Distortion"].default_value = 0.0

    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.16
    bump.inputs["Distance"].default_value = 0.08
    nt.links.new(tex.outputs["Color"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def dome_material():
    m = bpy.data.materials.new("HCT_Dome_Panel_Metal")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.56, 0.62, 0.67, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.82
    bsdf.inputs["Roughness"].default_value = 0.27

    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 5.0
    noise.inputs["Detail"].default_value = 2.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.43, 0.49, 0.54, 1.0)
    ramp.color_ramp.elements[-1].color = (0.74, 0.78, 0.81, 1.0)
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    return m


def gravel_material(name, base_a, base_b, scale=2.8, bump_strength=0.38):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    bump_noise = nt.nodes.new("ShaderNodeTexNoise")
    bump = nt.nodes.new("ShaderNodeBump")

    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 4.0
    noise.inputs["Roughness"].default_value = 0.78
    ramp.color_ramp.elements[0].color = base_a
    ramp.color_ramp.elements[-1].color = base_b

    bump_noise.inputs["Scale"].default_value = scale * 2.2
    bump_noise.inputs["Detail"].default_value = 3.0
    bump.inputs["Strength"].default_value = bump_strength
    bump.inputs["Distance"].default_value = 0.14

    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(bump_noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    bsdf.inputs["Roughness"].default_value = 0.96
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def build_materials():
    return {
        "terrain": terrain_material(),
        "facility": corrugated_white_material(),
        "dome": dome_material(),
        "dark": simple_material("HCT_Dark_Structure", (0.045, 0.052, 0.058, 1), 0.42, 0.35),
        "trim": simple_material("HCT_Oxide_Trim", (0.31, 0.10, 0.055, 1), 0.58, 0.05),
        "road_gravel": gravel_material(
            "HCT_Compacted_High_Altitude_Road",
            (0.29, 0.245, 0.19, 1.0),
            (0.43, 0.36, 0.27, 1.0),
            scale=3.2,
            bump_strength=0.46,
        ),
        "road_track": gravel_material(
            "HCT_Wheel_Worn_Track",
            (0.18, 0.16, 0.135, 1.0),
            (0.28, 0.235, 0.18, 1.0),
            scale=4.0,
            bump_strength=0.30,
        ),
        "shoulder": gravel_material(
            "HCT_Coarse_Road_Shoulder",
            (0.38, 0.31, 0.23, 1.0),
            (0.57, 0.49, 0.37, 1.0),
            scale=4.8,
            bump_strength=0.58,
        ),
        "concrete": simple_material("HCT_Concrete", (0.34, 0.34, 0.33, 1), 0.82, 0.0),
        "rock_light": simple_material("HCT_Rock_Light", (0.34, 0.28, 0.21, 1), 0.94, 0.0),
        "rock_dark": simple_material("HCT_Rock_Dark", (0.11, 0.095, 0.08, 1), 0.94, 0.0),
        "scrub": simple_material("HCT_Dry_Scrub", (0.20, 0.18, 0.10, 1), 0.95, 0.0),
        "panel": simple_material("HCT_Solar_Panel", (0.035, 0.10, 0.18, 1), 0.26, 0.20),
        "window": simple_material("HCT_Window", (0.02, 0.04, 0.055, 1), 0.22, 0.15),
        "rust": simple_material("HCT_Weathered_Rust", (0.26, 0.075, 0.035, 1), 0.78, 0.02),
        "platform": gravel_material(
            "HCT_Engineered_Concrete_Platform",
            (0.34, 0.335, 0.315, 1.0),
            (0.47, 0.455, 0.425, 1.0),
            scale=8.0,
            bump_strength=0.12,
        ),
        "stone_wall": gravel_material(
            "HCT_Dry_Stone_Retaining_Wall",
            (0.22, 0.18, 0.135, 1.0),
            (0.39, 0.32, 0.235, 1.0),
            scale=6.0,
            bump_strength=0.62,
        ),
        "cloud": simple_material("HCT_Cloud_White", (0.92, 0.94, 0.96, 1.0), 0.98, 0.0),
    }


# ----------------------------------------------------------------
# CONTINUOUS HANLE TERRAIN — NO RINGS, NO SEAMS, NO ISLAND
# ----------------------------------------------------------------

def rotated_gaussian(x, y, cx, cy, sx, sy, angle, amp):
    ca = math.cos(angle)
    sa = math.sin(angle)
    dx = x - cx
    dy = y - cy
    u = ca * dx + sa * dy
    v = -sa * dx + ca * dy
    return amp * math.exp(-((u / sx) ** 2 + (v / sy) ** 2))


def terrain_height(x, y, detail=1.0):
    """
    V5 refinement:
      * preserves one continuous terrain mesh
      * keeps the south/southwest valley open
      * breaks the previous broad smooth "sand dune" mountains into
        several asymmetric ridges with saddles and erosion folds
      * strengthens rocky local relief without turning the HCT pad into
        a noisy tabletop
    """
    z = 0.015 * x + 0.008 * y

    # Local observatory shoulder / ridge.
    z += rotated_gaussian(x, y, FACILITY_X - 3, FACILITY_Y + 4, 60, 36, math.radians(8), 9.4)
    z += rotated_gaussian(x, y, -28, 4, 48, 30, math.radians(-18), 3.5)

    # Broad open valleys, deliberately avoiding an enclosing bowl.
    z -= rotated_gaussian(x, y, -78, -118, 130, 100, math.radians(-14), 8.0)
    z -= rotated_gaussian(x, y, 68, -168, 170, 115, math.radians(10), 5.2)
    z -= rotated_gaussian(x, y, -155, -70, 95, 60, math.radians(25), 3.0)

    # Independent mountain systems. Each major massif is built from
    # several offset ridges plus a saddle/gully subtraction rather
    # than one smooth Gaussian hump.
    mountain_specs = (
        # cx, cy, angle, amp
        (-165, 118,  math.radians(14), 34.0),
        ( -25, 202,  math.radians(-6), 39.0),
        ( 158, 138,  math.radians(-22), 34.0),
        ( 228,  12,  math.radians(-35), 26.0),
        (-225,  -2,  math.radians(30), 22.0),
    )

    for cx, cy, ang, amp in mountain_specs:
        z += rotated_gaussian(x, y, cx, cy, 116, 28, ang, amp)
        z += rotated_gaussian(x, y, cx + 18*math.cos(ang), cy + 18*math.sin(ang),
                              66, 16, ang + 0.12, amp*0.34)
        z += rotated_gaussian(x, y, cx - 26*math.cos(ang), cy - 26*math.sin(ang),
                              54, 14, ang - 0.16, amp*0.26)
        # carve a subtle erosion saddle through each massif
        z -= rotated_gaussian(x, y, cx + 8*math.sin(ang), cy - 8*math.cos(ang),
                              38, 10, ang + math.pi/2, amp*0.10)

    # Additional ridge fingers create layered silhouettes.
    z += rotated_gaussian(x, y, -112, 146, 72, 14, math.radians(28), 8.5)
    z += rotated_gaussian(x, y,   55, 174, 78, 14, math.radians(-15), 10.0)
    z += rotated_gaussian(x, y,  112, 154, 58, 12, math.radians(-34), 7.0)

    dist = math.hypot(x - FACILITY_X, y - FACILITY_Y)
    far_factor = min(1.0, max(0.0, (dist - 28.0) / 145.0))

    # Erosion folds: stronger in distant ridges, gentle near HCT.
    folded = (
        1.8 * math.sin(x * 0.041 + y * 0.015)
        + 1.2 * math.cos(y * 0.051 - x * 0.014)
        + 0.85 * math.sin((x + y) * 0.067)
        + 0.55 * math.sin((x - 1.6*y) * 0.083)
    )
    ridged = (
        0.90 * abs(math.sin(x * 0.033 + y * 0.021))
        + 0.55 * abs(math.sin(x * 0.061 - y * 0.028))
    )
    z += far_factor * (folded + ridged)

    # Local rocky/gully relief.
    local = (
        0.62 * math.sin(x * 0.105 + 0.5)
        + 0.46 * math.cos(y * 0.125 - 0.8)
        + 0.28 * math.sin((x - y) * 0.17)
        - 0.28 * abs(math.sin(x * 0.19 + y * 0.055))
        - 0.16 * abs(math.cos(y * 0.21 - x * 0.04))
    )
    z += detail * local

    # Gently flatten only the immediate building footprint so the
    # facility sits naturally without creating a visible platform.
    fd = math.hypot(x - FACILITY_X, y - FACILITY_Y)
    if fd < 18.0:
        blend = (1.0 - fd / 18.0) ** 2
        reference = 8.55
        z = z * (1.0 - 0.30 * blend) + reference * (0.30 * blend)

    return z



def create_continuous_terrain(material, coll):
    verts = []
    faces = []
    for iy in range(GRID_Y + 1):
        fy = iy / GRID_Y
        y = -WORLD_HALF_Y + 2.0 * WORLD_HALF_Y * fy
        for ix in range(GRID_X + 1):
            fx = ix / GRID_X
            x = -WORLD_HALF_X + 2.0 * WORLD_HALF_X * fx
            z = terrain_height(x, y)
            verts.append((x, y, z))

    row = GRID_X + 1
    for iy in range(GRID_Y):
        for ix in range(GRID_X):
            a = iy * row + ix
            b = a + 1
            c = a + row + 1
            d = a + row
            faces.append((a, b, c, d))

    mesh = bpy.data.meshes.new("HCT_Continuous_Terrain_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("HCT_Continuous_Hanle_Terrain", mesh)
    coll.objects.link(obj)
    assign_material(obj, material)
    return obj


# ----------------------------------------------------------------
# FACILITY — REFERENCE-DRIVEN APPROXIMATE MASSING
# ----------------------------------------------------------------

def create_revolved_dome(name, center_xy, base_z, material, coll):
    # Engineered dome profile: short wall band + curved crown.
    profile = [
        (0.00, 5.90),
        (0.55, 5.90),
        (1.30, 5.78),
        (2.15, 5.45),
        (3.00, 4.90),
        (3.80, 4.10),
        (4.55, 3.05),
        (5.15, 1.85),
        (5.55, 0.65),
        (5.68, 0.15),
    ]
    segs = 64
    verts = []
    faces = []
    cx, cy = center_xy
    for iz, (zo, r) in enumerate(profile):
        for i in range(segs):
            a = (i / segs) * math.tau
            verts.append((cx + r * math.cos(a), cy + r * math.sin(a), base_z + zo))

    rows = len(profile)
    for iz in range(rows - 1):
        for i in range(segs):
            n = (i + 1) % segs
            a = iz * segs + i
            b = iz * segs + n
            c = (iz + 1) * segs + n
            d = (iz + 1) * segs + i
            faces.append((a, b, c, d))

    # top cap
    top_index = len(verts)
    verts.append((cx, cy, base_z + profile[-1][0] + 0.12))
    last = (rows - 1) * segs
    for i in range(segs):
        n = (i + 1) % segs
        faces.append((last + i, last + n, top_index))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    coll.objects.link(obj)
    assign_material(obj, material)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def add_panel_seams(cx, cy, base_z, radius, height, material, coll, count=14):
    # Vertical seam tubes around the dome lower/crown region.
    for i in range(count):
        a = (i / count) * math.tau
        pts = []
        for k in range(9):
            t = k / 8.0
            z = base_z + t * height
            # Approximate crown contraction.
            rr = radius * max(0.08, math.cos(t * math.pi / 2.0))
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a), z + 0.03))
        create_curve_tube(f"HCT_Dome_Seam_{i:02d}", pts, 0.025, material, coll)


def add_dome_shutter(cx, cy, base_z, material, coll):
    # Coherent front-to-back meridian slit ribbon + two rails.
    half_width = 0.52
    radius_y = 5.92
    height = 5.72
    steps = 30
    left = []
    right = []
    center = []
    for i in range(steps):
        t = -math.pi / 2 + (i / (steps - 1)) * math.pi
        y = cy + radius_y * math.sin(t)
        z = base_z + height * math.cos(t)
        left.append((cx - half_width, y, z + 0.05))
        right.append((cx + half_width, y, z + 0.05))
        center.append((cx, y, z + 0.06))

    verts = []
    faces = []
    for a, b in zip(left, right):
        verts.extend([a, b])
    for i in range(steps - 1):
        j = i * 2
        faces.append((j, j + 1, j + 3, j + 2))
    mesh = bpy.data.meshes.new("HCT_Dome_Slit_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    ribbon = bpy.data.objects.new("HCT_Dome_Slit", mesh)
    coll.objects.link(ribbon)
    assign_material(ribbon, material)

    create_curve_tube("HCT_Dome_Shutter_Rail_L", left, 0.075, material, coll)
    create_curve_tube("HCT_Dome_Shutter_Rail_R", right, 0.075, material, coll)
    return ribbon


def add_balcony(cx, cy, z, radius, materials, coll):
    add_cylinder("HCT_Balcony_Platform", (cx, cy, z), radius, 0.26, materials["dark"], coll, vertices=64)
    rail_z = z + 0.78
    add_torus("HCT_Balcony_Top_Rail", (cx, cy, rail_z), radius - 0.18, 0.045, materials["dark"], coll)
    add_torus("HCT_Balcony_Mid_Rail", (cx, cy, z + 0.43), radius - 0.18, 0.035, materials["dark"], coll)
    for i in range(24):
        a = (i / 24) * math.tau
        px = cx + (radius - 0.18) * math.cos(a)
        py = cy + (radius - 0.18) * math.sin(a)
        add_cylinder(f"HCT_Balcony_Post_{i:02d}", (px, py, z + 0.39), 0.035, 0.78, materials["dark"], coll, vertices=8)


def add_facade_opening(name, location, dimensions, material, coll, bevel=0.04):
    return add_cube(name, location, dimensions, material, coll, bevel=bevel)


def add_railing_line(name, start_pt, end_pt, z, material, coll, posts=8):
    sx, sy = start_pt
    ex, ey = end_pt
    points = [(sx, sy, z), (ex, ey, z)]
    create_curve_tube(name + "_Top", points, 0.035, material, coll)
    create_curve_tube(name + "_Mid", [(sx, sy, z-0.32), (ex, ey, z-0.32)], 0.025, material, coll)
    for i in range(posts + 1):
        t = i / posts
        x = sx + (ex - sx) * t
        y = sy + (ey - sy) * t
        add_cylinder(f"{name}_Post_{i:02d}", (x, y, z-0.30), 0.028, 0.62, material, coll, vertices=8)


def create_facility(materials, coll):
    """
    V6 architectural refinement:
      * broader/lower HCT body
      * stronger asymmetry and service volumes
      * larger integrated drum/dome enclosure
      * proper catwalk identity
      * front/side/rear facade cues for 360 viewing
      * small exterior landing / service railing
      * roof utility boxes and corrugated-metal visual hierarchy
    """
    gx = FACILITY_X
    gy = FACILITY_Y
    gz = terrain_height(gx, gy, detail=0.08)

    # Primary low rectangular body.
    main = add_cube(
        "HCT_Main_Building",
        (gx, gy, gz + 3.05),
        (23.0, 16.4, 6.1),
        materials["facility"], coll, bevel=0.20,
    )

    # East service body and low projecting annex.
    east = add_cube(
        "HCT_East_Service_Wing",
        (gx + 13.5, gy - 0.8, gz + 2.45),
        (10.8, 12.0, 4.9),
        materials["facility"], coll, bevel=0.15,
    )
    add_cube(
        "HCT_East_Low_Annex",
        (gx + 18.2, gy + 3.7, gz + 1.65),
        (6.0, 6.7, 3.3),
        materials["facility"], coll, bevel=0.12,
    )

    # West/rear stepped mass and a narrower connector.
    west = add_cube(
        "HCT_West_Rear_Wing",
        (gx - 10.8, gy + 4.8, gz + 2.55),
        (9.6, 9.8, 5.1),
        materials["facility"], coll, bevel=0.15,
    )
    add_cube(
        "HCT_Rear_Utility_Block",
        (gx - 3.0, gy + 9.5, gz + 1.95),
        (12.0, 5.2, 3.9),
        materials["facility"], coll, bevel=0.12,
    )

    # Central telescope pedestal and transition deck.
    add_cube(
        "HCT_Telescope_Pedestal",
        (gx - 0.8, gy + 0.5, gz + 6.35),
        (14.4, 11.8, 2.4),
        materials["facility"], coll, bevel=0.14,
    )
    add_cylinder(
        "HCT_Drum_Base_Collar",
        (gx - 1.0, gy + 0.6, gz + 7.45),
        6.55, 0.55, materials["dark"], coll, vertices=64,
    )

    cx = gx - 1.0
    cy = gy + 0.6
    drum_radius = 6.05
    drum_depth = 6.65
    drum_base = gz + 7.45

    drum = add_cylinder(
        "HCT_Telescope_Drum",
        (cx, cy, drum_base + drum_depth/2),
        drum_radius, drum_depth,
        materials["facility"], coll, vertices=72, bevel=0.10,
    )

    # Strong horizontal structural bands visible in real HCT photos.
    add_torus("HCT_Drum_Lower_Band", (cx, cy, drum_base + 0.38), drum_radius + 0.06, 0.12, materials["dark"], coll)
    add_torus("HCT_Drum_Upper_Band", (cx, cy, drum_base + drum_depth - 0.42), drum_radius + 0.08, 0.13, materials["dark"], coll)

    balcony_z = drum_base + drum_depth - 0.18
    add_balcony(cx, cy, balcony_z, drum_radius + 0.82, materials, coll)

    # Additional balcony brackets make the catwalk look attached, not floating.
    for i in range(12):
        a = (i / 12) * math.tau
        bx = cx + (drum_radius + 0.25) * math.cos(a)
        by = cy + (drum_radius + 0.25) * math.sin(a)
        add_cube(
            f"HCT_Balcony_Bracket_{i:02d}",
            (bx, by, balcony_z - 0.42),
            (0.16, 0.16, 0.75),
            materials["dark"], coll,
            rotation=(0, 0, a),
            bevel=0.02,
        )

    dome_base = balcony_z + 0.76
    dome = create_revolved_dome("HCT_Dome", (cx, cy), dome_base, materials["dome"], coll)
    add_panel_seams(cx, cy, dome_base, 5.92, 5.55, materials["dark"], coll, count=18)
    add_dome_shutter(cx, cy, dome_base, materials["dark"], coll)

    # Dome base lip / engineered joint.
    add_torus("HCT_Dome_Base_Lip", (cx, cy, dome_base + 0.10), 5.92, 0.11, materials["dark"], coll)

    # Front facade.
    front_y = gy - 16.4/2 - 0.05
    add_facade_opening("HCT_Main_Door_Frame", (gx + 1.4, front_y, gz + 1.85), (2.65, 0.17, 3.85), materials["trim"], coll)
    add_facade_opening("HCT_Main_Door", (gx + 1.4, front_y - 0.05, gz + 1.85), (2.08, 0.13, 3.35), materials["dark"], coll)
    for j, xoff in enumerate((-6.3, -3.0, 6.2)):
        add_facade_opening(
            f"HCT_Front_Window_{j:02d}",
            (gx + xoff, front_y - 0.05, gz + 2.25),
            (2.15, 0.13, 1.55),
            materials["window"], coll,
        )

    # East service windows and vent.
    east_x = gx + 13.5 + 10.8/2 + 0.05
    for j, yoff in enumerate((-3.2, 0.5, 3.8)):
        add_facade_opening(
            f"HCT_East_Window_{j:02d}",
            (east_x, gy + yoff, gz + 2.25),
            (0.13, 2.0, 1.45),
            materials["window"], coll,
        )
    add_facade_opening("HCT_East_Vent", (east_x, gy + 0.4, gz + 4.15), (0.13, 2.6, 0.85), materials["dark"], coll)

    # West/rear windows.
    rear_y = gy + 4.8 + 9.8/2 + 0.05
    for j, xoff in enumerate((-13.0, -9.0)):
        add_facade_opening(
            f"HCT_Rear_Window_{j:02d}",
            (gx + xoff, rear_y, gz + 2.3),
            (2.0, 0.13, 1.45),
            materials["window"], coll,
        )

    # Roof utility objects and short railing/landing near service side.
    add_cube("HCT_Roof_Utility_A", (gx + 6.3, gy + 4.0, gz + 6.9), (3.2, 2.6, 1.25), materials["facility"], coll, bevel=0.08)
    add_cube("HCT_Roof_Utility_B", (gx - 7.0, gy + 5.4, gz + 6.4), (2.3, 2.0, 0.9), materials["facility"], coll, bevel=0.06)

    landing_z = gz + 4.95
    add_cube("HCT_Service_Landing", (gx + 12.0, gy + 4.5, landing_z), (5.0, 2.0, 0.18), materials["dark"], coll, bevel=0.04)
    add_railing_line("HCT_Service_Rail_A", (gx+9.7, gy+5.35), (gx+14.3, gy+5.35), landing_z+0.8, materials["dark"], coll, posts=6)
    add_railing_line("HCT_Service_Rail_B", (gx+14.3, gy+5.35), (gx+14.3, gy+3.75), landing_z+0.8, materials["dark"], coll, posts=3)

    return {
        "x": gx, "y": gy, "z": gz,
        "cx": cx, "cy": cy,
        "target_z": dome_base + 2.8,
        "main": main, "drum": drum, "dome": dome,
    }


# ----------------------------------------------------------------
# V7 SITE ENGINEERING — SWITCHBACK ACCESS ROAD + CONCRETE PLATEAU
# ----------------------------------------------------------------

ROAD_CENTERLINES = []


def catmull_rom_3d(points, samples=18):
    """Smooth 3D Catmull-Rom path through explicitly graded control points."""
    padded = [points[0]] + list(points) + [points[-1]]
    result = []
    for i in range(1, len(padded) - 2):
        p0, p1, p2, p3 = padded[i-1], padded[i], padded[i+1], padded[i+2]
        for s in range(samples):
            t = s / samples
            t2 = t*t
            t3 = t2*t
            xyz = []
            for axis in range(3):
                v = 0.5 * (
                    2.0*p1[axis]
                    + (-p0[axis] + p2[axis])*t
                    + (2.0*p0[axis] - 5.0*p1[axis] + 4.0*p2[axis] - p3[axis])*t2
                    + (-p0[axis] + 3.0*p1[axis] - 3.0*p2[axis] + p3[axis])*t3
                )
                xyz.append(v)
            result.append(tuple(xyz))
    result.append(points[-1])
    return result


def graded_control_points(xy_points, end_z=None, clearance=0.42):
    """
    Convert XY switchback controls into a monotonically rising 3D road.
    The road follows the mountain rather than floating as a graphic ribbon.
    """
    controls = []
    prev_z = None
    for i, (x, y) in enumerate(xy_points):
        terrain_z = terrain_height(x, y, detail=0.035)
        z = terrain_z + clearance
        if prev_z is not None:
            z = max(z, prev_z + 0.08)
        controls.append([x, y, z])
        prev_z = z

    if end_z is not None:
        # Blend the final controls gently upward into the engineered plateau.
        n = min(4, len(controls))
        start_i = len(controls) - n
        z0 = controls[start_i][2]
        for j in range(n):
            t = j / (n - 1)
            smooth = t*t*(3.0 - 2.0*t)
            desired = z0*(1.0-smooth) + end_z*smooth
            controls[start_i+j][2] = max(controls[start_i+j][2], desired)

    return [tuple(p) for p in controls]


def create_prism_ribbon(name, centerline, width, thickness, material, coll):
    """
    Physical road prism with top, underside, and side faces.
    This replaces the old zero-depth / stacked-ribbon appearance.
    """
    half = width / 2.0
    top_left, top_right = [], []

    for i, p in enumerate(centerline):
        x, y, z = p
        if i == 0:
            dx = centerline[1][0] - x
            dy = centerline[1][1] - y
        elif i == len(centerline)-1:
            dx = x - centerline[i-1][0]
            dy = y - centerline[i-1][1]
        else:
            dx = centerline[i+1][0] - centerline[i-1][0]
            dy = centerline[i+1][1] - centerline[i-1][1]

        L = max(1e-6, math.hypot(dx, dy))
        px, py = -dy/L, dx/L
        top_left.append((x + px*half, y + py*half, z))
        top_right.append((x - px*half, y - py*half, z))

    verts = []
    for l, r in zip(top_left, top_right):
        verts.extend([
            l, r,
            (l[0], l[1], l[2]-thickness),
            (r[0], r[1], r[2]-thickness),
        ])

    faces = []
    for i in range(len(centerline)-1):
        a = i*4
        b = (i+1)*4
        # top
        faces.append((a, a+1, b+1, b))
        # left side
        faces.append((a, b, b+2, a+2))
        # right side
        faces.append((a+1, a+3, b+3, b+1))
        # underside
        faces.append((a+2, b+2, b+3, a+3))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    coll.objects.link(obj)
    assign_material(obj, material)
    return obj, top_left, top_right


def create_surface_ribbon(name, centerline, width, z_offset, material, coll):
    """Thin top dressing used for wheel-worn compacted tracks."""
    half = width / 2.0
    verts, faces = [], []
    for i, p in enumerate(centerline):
        x, y, z = p
        if i == 0:
            dx = centerline[1][0] - x
            dy = centerline[1][1] - y
        elif i == len(centerline)-1:
            dx = x - centerline[i-1][0]
            dy = y - centerline[i-1][1]
        else:
            dx = centerline[i+1][0] - centerline[i-1][0]
            dy = centerline[i+1][1] - centerline[i-1][1]
        L = max(1e-6, math.hypot(dx, dy))
        px, py = -dy/L, dx/L
        verts.extend([
            (x + px*half, y + py*half, z+z_offset),
            (x - px*half, y - py*half, z+z_offset),
        ])

    for i in range(len(centerline)-1):
        j = i*2
        faces.append((j, j+1, j+3, j+2))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    coll.objects.link(obj)
    assign_material(obj, material)
    return obj


def add_segment_box(name, p1, p2, width, height, material, coll):
    """Horizontal oriented retaining/edge block between two XY points."""
    x1, y1, z1 = p1
    x2, y2, z2 = p2
    dx, dy = x2-x1, y2-y1
    length = math.hypot(dx, dy)
    if length < 0.05:
        return None
    angle = math.atan2(dy, dx)
    zmid = (z1+z2)/2.0
    return add_cube(
        name,
        ((x1+x2)/2.0, (y1+y2)/2.0, zmid),
        (length, width, height),
        material, coll,
        rotation=(0, 0, angle),
        bevel=min(0.08, width*0.15),
    )


def create_retaining_walls(prefix, centerline, left_edge, right_edge, materials, coll):
    """
    Add stone retaining construction only where road is genuinely elevated
    above the adjacent mountain surface. No decorative wall everywhere.
    """
    wall_index = 0
    step = 4
    for side_name, edge in (("L", left_edge), ("R", right_edge)):
        for i in range(0, len(edge)-step, step):
            p0 = edge[i]
            p1 = edge[i+step]
            tx = (p0[0]+p1[0])/2.0
            ty = (p0[1]+p1[1])/2.0
            top_z = (p0[2]+p1[2])/2.0 - 0.15
            ground_z = terrain_height(tx, ty, detail=0.12)
            exposed = top_z - ground_z

            if exposed < 0.55:
                continue

            h = min(4.2, exposed + 0.25)
            q0 = (p0[0], p0[1], top_z - h/2.0)
            q1 = (p1[0], p1[1], top_z - h/2.0)
            add_segment_box(
                f"{prefix}_Retaining_{side_name}_{wall_index:03d}",
                q0, q1, 0.52, h,
                materials["stone_wall"], coll,
            )
            wall_index += 1


def clamp_line_to_terrain(centerline, minimum_clearance=0.30, end_target_z=None, end_blend_count=24):
    """
    Final road continuity safeguard.

    Catmull-Rom interpolation can dip between otherwise valid control points.
    That was the source of apparently 'disconnected' road pieces where the
    generated surface briefly passed through the terrain.

    Every sampled road point is now guaranteed to remain above the actual
    continuous Hanle terrain. The final approach may additionally blend into
    the summit terrace without changing the road's XY shape.
    """
    corrected = []
    total = len(centerline)

    for i, (x, y, z) in enumerate(centerline):
        safe_z = max(z, terrain_height(x, y, detail=0.045) + minimum_clearance)

        if end_target_z is not None and i >= max(0, total - end_blend_count):
            denom = max(1, end_blend_count - 1)
            t = (i - (total - end_blend_count)) / denom
            t = max(0.0, min(1.0, t))
            smooth = t*t*(3.0 - 2.0*t)
            safe_z = safe_z*(1.0-smooth) + end_target_z*smooth

        corrected.append((x, y, safe_z))

    return corrected


def terrain_hugging_line(xy_controls, samples=16, clearance=0.22):
    """
    Auxiliary access is not an elevated viaduct.

    It follows the terrain closely, including small rises and falls, so the
    contextual observatory buildings remain connected by a believable
    high-altitude gravel track.
    """
    # Smooth XY first; Z is sampled afterwards directly from the terrain.
    padded = [xy_controls[0]] + list(xy_controls) + [xy_controls[-1]]
    xy_line = []

    for i in range(1, len(padded) - 2):
        p0, p1, p2, p3 = padded[i-1], padded[i], padded[i+1], padded[i+2]
        for s in range(samples):
            t = s / samples
            t2 = t*t
            t3 = t2*t

            x = 0.5 * (
                2.0*p1[0]
                + (-p0[0]+p2[0])*t
                + (2.0*p0[0]-5.0*p1[0]+4.0*p2[0]-p3[0])*t2
                + (-p0[0]+3.0*p1[0]-3.0*p2[0]+p3[0])*t3
            )
            y = 0.5 * (
                2.0*p1[1]
                + (-p0[1]+p2[1])*t
                + (2.0*p0[1]-5.0*p1[1]+4.0*p2[1]-p3[1])*t2
                + (-p0[1]+3.0*p1[1]-3.0*p2[1]+p3[1])*t3
            )
            z = terrain_height(x, y, detail=0.07) + clearance
            xy_line.append((x, y, z))

    x, y = xy_controls[-1]
    xy_line.append((x, y, terrain_height(x, y, detail=0.07) + clearance))
    return xy_line


def create_engineered_plateau(materials, coll):
    """
    Final grounded summit terrace.

    V7's top slabs were visually correct in plan but some edges floated above
    the naturally undulating terrain. V7.1 keeps the exact same footprint and
    does NOT touch the HCT building or surrounding ridges. It adds buried
    compacted/stone foundation mass beneath each slab so the entire summit
    reads as a constructed, load-bearing observatory terrace.
    """
    gx, gy = FACILITY_X, FACILITY_Y
    gz = terrain_height(gx, gy, detail=0.05)

    # ------------------------------------------------------------------
    # Buried / retaining foundation masses.
    # Their upper surfaces sit just below the finished concrete slabs.
    # Most of each mass remains inside the natural terrain.
    # ------------------------------------------------------------------
    add_cube(
        "HCT_Main_Platform_Stone_Foundation",
        (gx+2.0, gy+1.0, gz-1.55),
        (52.8, 36.8, 3.10),
        materials["stone_wall"], coll,
        bevel=1.45,
    )
    add_cube(
        "HCT_Arrival_Apron_Stone_Foundation",
        (gx+1.0, gy-16.2, gz-1.15),
        (33.8, 13.8, 2.30),
        materials["stone_wall"], coll,
        bevel=1.15,
    )
    add_cube(
        "HCT_East_Service_Stone_Foundation",
        (gx+24.0, gy+2.0, gz-1.10),
        (16.8, 20.8, 2.20),
        materials["stone_wall"], coll,
        bevel=1.00,
    )
    add_cube(
        "HCT_Rear_Service_Stone_Foundation",
        (gx-8.0, gy+20.0, gz-1.05),
        (22.8, 12.8, 2.10),
        materials["stone_wall"], coll,
        bevel=0.95,
    )

    # ------------------------------------------------------------------
    # Finished concrete hardstanding.
    # Thin slabs now sit on the foundation instead of visually floating.
    # ------------------------------------------------------------------
    main = add_cube(
        "HCT_Concrete_Main_Platform",
        (gx+2.0, gy+1.0, gz-0.10),
        (54.0, 38.0, 0.36),
        materials["platform"], coll,
        bevel=2.1,
    )

    front = add_cube(
        "HCT_Concrete_Arrival_Apron",
        (gx+1.0, gy-16.2, gz-0.08),
        (35.0, 15.0, 0.32),
        materials["platform"], coll,
        bevel=1.7,
    )

    east = add_cube(
        "HCT_Concrete_East_Service_Area",
        (gx+24.0, gy+2.0, gz-0.09),
        (18.0, 22.0, 0.32),
        materials["platform"], coll,
        bevel=1.5,
    )

    rear = add_cube(
        "HCT_Concrete_Rear_Service_Area",
        (gx-8.0, gy+20.0, gz-0.09),
        (24.0, 14.0, 0.32),
        materials["platform"], coll,
        bevel=1.4,
    )

    # Downslope retaining faces blend the terrace into the ridge.
    wall_z = gz - 0.72
    add_cube(
        "HCT_Platform_Retaining_Front",
        (gx+2.0, gy-18.6, wall_z),
        (54.0, 0.78, 1.55),
        materials["stone_wall"], coll,
        bevel=0.08,
    )
    add_cube(
        "HCT_Platform_Retaining_West",
        (gx-25.4, gy+0.0, wall_z),
        (0.78, 36.0, 1.55),
        materials["stone_wall"], coll,
        bevel=0.08,
    )

    return {
        "z": gz,
        "surface_z": gz + 0.08,
        "main": main,
        "front": front,
        "east": east,
        "rear": rear,
    }


def create_road(materials, coll):
    """
    FINAL V7.1 road correction.

    Preserved:
      * V7 switchback XY layout
      * V7 main-road width and character
      * V7 retaining-wall logic

    Corrected:
      * no terrain-hidden/disconnected main-road sections
      * main road blends continuously into the summit apron
      * auxiliary road is terrain-hugging, not incorrectly elevated
      * auxiliary road no longer receives viaduct-style retaining walls
    """
    plateau_surface_z = terrain_height(FACILITY_X, FACILITY_Y, detail=0.05) + 0.14

    # --------------------------------------------------------------
    # MAIN SWITCHBACK ROAD — same successful V7 XY geometry.
    # --------------------------------------------------------------
    main_xy = [
        (-154, -132),
        (-116, -112),
        (-69, -90),
        (-111, -63),
        (-61, -40),
        (-87, -13),
        (-35, -1),
        (-7, -5),
        (8, -6),
        (16, -5),
    ]

    main_controls = graded_control_points(
        main_xy,
        end_z=plateau_surface_z,
        clearance=0.48,
    )
    main_line = catmull_rom_3d(main_controls, samples=20)

    # Clamp every interpolated point above terrain to eliminate the
    # disappearing road sections visible in V7.
    main_line = clamp_line_to_terrain(
        main_line,
        minimum_clearance=0.40,
        end_target_z=plateau_surface_z,
        end_blend_count=30,
    )

    _, base_left, base_right = create_prism_ribbon(
        "HCT_Main_Access_Foundation",
        main_line,
        8.4,
        0.72,
        materials["shoulder"],
        coll,
    )

    create_prism_ribbon(
        "HCT_Main_Access_Road",
        [(x, y, z+0.12) for x, y, z in main_line],
        5.8,
        0.40,
        materials["road_gravel"],
        coll,
    )

    create_surface_ribbon(
        "HCT_Main_Access_Wheel_Wear",
        [(x, y, z+0.15) for x, y, z in main_line],
        3.05,
        0.022,
        materials["road_track"],
        coll,
    )

    create_retaining_walls(
        "HCT_Main_Access",
        main_line,
        base_left,
        base_right,
        materials,
        coll,
    )

    # A short compacted-gravel transition overlaps the concrete arrival
    # apron, guaranteeing an unbroken visual/driveable connection.
    main_end = main_line[-1]
    transition = [
        main_end,
        (
            main_end[0] + 0.6,
            main_end[1] + 2.4,
            plateau_surface_z + 0.02,
        ),
        (
            FACILITY_X,
            FACILITY_Y - 12.0,
            plateau_surface_z + 0.02,
        ),
    ]
    transition_line = catmull_rom_3d(transition, samples=12)
    transition_line = clamp_line_to_terrain(
        transition_line,
        minimum_clearance=0.24,
        end_target_z=plateau_surface_z+0.02,
        end_blend_count=18,
    )
    create_prism_ribbon(
        "HCT_Main_Access_To_Apron_Transition",
        transition_line,
        5.8,
        0.30,
        materials["road_gravel"],
        coll,
    )

    # --------------------------------------------------------------
    # AUXILIARY ACCESS — ground-following gravel track.
    # No forced monotonically rising Z, no tall retaining walls.
    # --------------------------------------------------------------
    aux_xy = [
        (-36, -1),
        (-42, 10),
        (-47, 22),
        (-52, 33),
        (-58, 43),
    ]
    aux_line = terrain_hugging_line(
        aux_xy,
        samples=16,
        clearance=0.24,
    )

    # Coarse shoulder is shallow and partially buried.
    create_prism_ribbon(
        "HCT_Auxiliary_Access_Foundation",
        aux_line,
        6.2,
        0.24,
        materials["shoulder"],
        coll,
    )
    create_prism_ribbon(
        "HCT_Auxiliary_Access_Road",
        [(x, y, z+0.07) for x, y, z in aux_line],
        4.5,
        0.20,
        materials["road_gravel"],
        coll,
    )
    create_surface_ribbon(
        "HCT_Auxiliary_Access_Wheel_Wear",
        [(x, y, z+0.08) for x, y, z in aux_line],
        2.5,
        0.018,
        materials["road_track"],
        coll,
    )

    # Summit terrace is created after road geometry so the apron overlaps
    # the final approach slightly and hides any seam.
    plateau = create_engineered_plateau(materials, coll)

    global ROAD_CENTERLINES
    ROAD_CENTERLINES = [
        (main_line, 8.4),
        (aux_line, 6.2),
        (transition_line, 5.8),
    ]

    return {
        "main": main_line,
        "transition": transition_line,
        "auxiliary": aux_line,
        "plateau": plateau,
    }


# ----------------------------------------------------------------
# LINKED ROCK / SPARSE HIGH-ALTITUDE VEGETATION
# ----------------------------------------------------------------

def create_rock_prototype(name, material, coll, subdivisions=1):
    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=subdivisions, radius=1.0, location=(0,0,-999)
    )
    obj = bpy.context.active_object
    obj.name = name
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    for v in bm.verts:
        v.co *= random.uniform(0.70, 1.32)
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()
    assign_material(obj, material)
    move_to_collection(obj, coll)
    obj.hide_render = True
    obj.hide_viewport = True
    return obj


def create_scrub_prototype(name, material, coll):
    """Low dry tuft made from crossed triangular blades."""
    verts = []
    faces = []
    blade_count = 6
    for i in range(blade_count):
        a = (i/blade_count)*math.tau
        dx = 0.28*math.cos(a)
        dy = 0.28*math.sin(a)
        px = -0.07*math.sin(a)
        py = 0.07*math.cos(a)
        base = len(verts)
        verts.extend([
            (dx-px, dy-py, 0.0),
            (dx+px, dy+py, 0.0),
            (dx*0.30, dy*0.30, 0.62+0.10*math.sin(i*1.7)),
        ])
        faces.append((base, base+1, base+2))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    coll.objects.link(obj)
    assign_material(obj, material)
    obj.hide_render = True
    obj.hide_viewport = True
    return obj


def linked_instance(proto, name, location, scale, rotation, coll):
    obj = bpy.data.objects.new(name, proto.data)
    coll.objects.link(obj)
    obj.location = location
    obj.scale = scale
    obj.rotation_euler = rotation
    return obj


def point_segment_distance_2d(px, py, a, b):
    ax, ay = a[0], a[1]
    bx, by = b[0], b[1]
    vx, vy = bx-ax, by-ay
    wx, wy = px-ax, py-ay
    denom = vx*vx + vy*vy
    if denom < 1e-9:
        return math.hypot(px-ax, py-ay)
    t = max(0.0, min(1.0, (wx*vx + wy*vy)/denom))
    qx = ax + t*vx
    qy = ay + t*vy
    return math.hypot(px-qx, py-qy)


def too_close_to_engineered_area(x, y, margin=3.0):
    # Concrete HCT platform.
    if abs(x-(FACILITY_X+2.0)) < 30.0 and abs(y-(FACILITY_Y+1.0)) < 22.0:
        return True

    # Actual generated road centerlines.
    for line, width in ROAD_CENTERLINES:
        threshold = width/2.0 + margin
        for i in range(len(line)-1):
            if point_segment_distance_2d(x, y, line[i], line[i+1]) < threshold:
                return True
    return False


def create_road_edge_stones(protos, coll):
    """Irregular stone borders, concentrated near exposed bends—not curbs."""
    idx = 0
    for line, width in ROAD_CENTERLINES:
        if not line:
            continue
        for i in range(5, len(line)-5, 7):
            if random.random() < 0.34:
                continue
            p = line[i]
            pprev = line[i-1]
            pnext = line[i+1]
            dx = pnext[0]-pprev[0]
            dy = pnext[1]-pprev[1]
            L = max(1e-6, math.hypot(dx,dy))
            nx, ny = -dy/L, dx/L

            for side in (-1.0, 1.0):
                # Slightly outside the coarse gravel shoulder.
                offset = width/2.0 + random.uniform(0.35, 1.15)
                x = p[0] + nx*offset*side
                y = p[1] + ny*offset*side
                z = terrain_height(x,y,detail=0.10) + 0.16
                proto = random.choice(protos)
                s = random.uniform(0.28, 0.70)
                linked_instance(
                    proto,
                    f"HCT_Road_Edge_Stone_{idx:03d}",
                    (x,y,z),
                    (s, s*random.uniform(0.75,1.25), s*random.uniform(0.45,0.82)),
                    (random.uniform(-0.15,0.15), random.uniform(-0.15,0.15), random.uniform(0,math.tau)),
                    coll,
                )
                idx += 1


def create_scatter(materials, coll):
    p1 = create_rock_prototype("HCT_Rock_Proto_A", materials["rock_light"], coll, 1)
    p2 = create_rock_prototype("HCT_Rock_Proto_B", materials["rock_dark"], coll, 1)
    p3 = create_rock_prototype("HCT_Rock_Proto_C", materials["rock_light"], coll, 2)
    protos = [p1,p2,p3]

    # General stony high-altitude ground.
    for i in range(210):
        x = random.uniform(-105, 105)
        y = random.uniform(-92, 88)
        if too_close_to_engineered_area(x,y,margin=1.8):
            continue
        z = terrain_height(x,y,detail=0.22) + 0.14
        proto = random.choice(protos[:2])
        s = random.uniform(0.16, 0.62)
        linked_instance(
            proto, f"HCT_Rock_S_{i:03d}",
            (x,y,z),
            (s, s*random.uniform(0.70,1.30), s*random.uniform(0.45,0.88)),
            (random.uniform(-0.22,0.22), random.uniform(-0.22,0.22), random.uniform(0,math.tau)),
            coll,
        )

    for i in range(34):
        x = random.uniform(-92, 96)
        y = random.uniform(-78, 80)
        if too_close_to_engineered_area(x,y,margin=2.8):
            continue
        z = terrain_height(x,y,detail=0.20) + 0.30
        s = random.uniform(0.95, 2.25)
        linked_instance(
            p3, f"HCT_Boulder_{i:02d}",
            (x,y,z),
            (s, s*random.uniform(0.65,1.18), s*random.uniform(0.42,0.80)),
            (random.uniform(-0.30,0.30), random.uniform(-0.30,0.30), random.uniform(0,math.tau)),
            coll,
        )

    # Road-edge stones: natural rough shoulder, not a continuous bright border.
    create_road_edge_stones([p1,p2], coll)

    # Sparse high-altitude vegetation. Still overwhelmingly barren.
    scrub_proto = create_scrub_prototype("HCT_Scrub_Proto", materials["scrub"], coll)
    vegetation_index = 0
    attempts = 0
    while vegetation_index < 68 and attempts < 500:
        attempts += 1
        x = random.uniform(-100, 100)
        y = random.uniform(-88, 84)
        if too_close_to_engineered_area(x,y,margin=3.8):
            continue
        # Favor slightly lower/protected terrain rather than exposed summits.
        local_z = terrain_height(x,y,detail=0.10)
        if local_z > 15 and random.random() < 0.70:
            continue
        s = random.uniform(0.50, 1.15)
        linked_instance(
            scrub_proto,
            f"HCT_Scrub_{vegetation_index:03d}",
            (x,y,local_z+0.08),
            (s, s*random.uniform(0.75,1.20), s*random.uniform(0.65,1.25)),
            (0,0,random.uniform(0,math.tau)),
            coll,
        )
        vegetation_index += 1


def add_beam_between(name, p1, p2, radius, material, coll, vertices=10):
    """Create a cylindrical beam between two 3D points."""
    a = Vector(p1)
    b = Vector(p2)
    mid = (a + b) * 0.5
    direction = b - a
    length = direction.length
    if length < 1e-6:
        return None
    obj = add_cylinder(name, mid, radius, length, material, coll, vertices=vertices)
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    return obj


# ----------------------------------------------------------------
# SITE INFRASTRUCTURE
# ----------------------------------------------------------------

def create_parabolic_dish(name, location, radius, depth, material, dark_material, coll, tilt=(0,0,0)):
    rings = 12
    segs = 40
    verts = []
    faces = []
    for r_i in range(rings + 1):
        rr = radius * r_i / rings
        z = depth * (rr / radius) ** 2
        for i in range(segs):
            a = (i / segs) * math.tau
            verts.append((rr*math.cos(a), rr*math.sin(a), z))
    for r_i in range(rings):
        for i in range(segs):
            n = (i + 1) % segs
            a = r_i*segs + i
            b = r_i*segs + n
            c = (r_i+1)*segs + n
            d = (r_i+1)*segs + i
            faces.append((a,b,c,d))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    coll.objects.link(obj)
    obj.location = location
    obj.rotation_euler = tilt
    assign_material(obj, material)
    for poly in obj.data.polygons:
        poly.use_smooth = True

    # Mount + tripod. The bowl itself is communications infrastructure.
    mount_base = (location[0], location[1], location[2]-2.0)
    hub = (location[0], location[1], location[2]-0.55)
    add_beam_between(f"{name}_Mast", mount_base, hub, 0.11, dark_material, coll, 10)

    for i, offset in enumerate(((-1.35,-0.85), (1.25,-0.75), (0.15,1.35))):
        foot = (location[0]+offset[0], location[1]+offset[1], location[2]-2.05)
        add_beam_between(f"{name}_Tripod_{i:02d}", foot, hub, 0.075, dark_material, coll, 8)

    # Feed boom provides a clearer parabolic-dish identity.
    feed_tip = (location[0], location[1]-1.6, location[2]+0.25)
    add_beam_between(f"{name}_Feed_Arm", hub, feed_tip, 0.055, dark_material, coll, 8)
    add_cylinder(f"{name}_Feed", feed_tip, 0.13, 0.34, dark_material, coll, vertices=12)

    return obj



def create_context_dome(name, x, y, scale, materials, coll):
    """
    Simplified contextual observatory structure.
    Placement is approximate/reference-inspired, not claimed survey location.
    """
    z = terrain_height(x, y, detail=0.18)
    add_cube(
        f"{name}_Building",
        (x, y, z + 2.0*scale),
        (8.0*scale, 7.0*scale, 4.0*scale),
        materials["facility"], coll, bevel=0.12*scale,
    )
    add_cylinder(
        f"{name}_Drum",
        (x, y, z + 5.25*scale),
        2.45*scale, 2.8*scale,
        materials["facility"], coll, vertices=40,
    )
    # Simple cap for a subordinate distant structure.
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32, ring_count=16,
        location=(x, y, z + 6.8*scale)
    )
    dome = bpy.context.active_object
    dome.name = f"{name}_Dome"
    dome.scale = (2.55*scale, 2.55*scale, 2.15*scale)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_material(dome, materials["dome"])
    move_to_collection(dome, coll)

    # Small gravel apron.
    add_cube(
        f"{name}_Apron",
        (x, y - 4.0*scale, z + 0.10),
        (11.0*scale, 8.5*scale, 0.20),
        materials["platform"], coll, bevel=1.0*scale,
    )


def create_infrastructure(materials, facility_data, coll):
    gx, gy, gz = facility_data["x"], facility_data["y"], facility_data["z"]

    # Communications dish with visible mast / feed arm / tripod.
    dish_x = gx - 11.5
    dish_y = gy - 10.8
    dish_z = terrain_height(dish_x, dish_y, detail=0.10) + 2.6
    dish = create_parabolic_dish(
        "HCT_Communications_Dish",
        (dish_x, dish_y, dish_z),
        2.55, 0.76,
        materials["facility"], materials["dark"], coll,
        tilt=(math.radians(-48), 0, math.radians(18)),
    )

    # Feed arm.
    feed_start = (dish_x, dish_y - 0.2, dish_z + 0.2)
    feed_end = (dish_x, dish_y - 1.5, dish_z + 2.1)
    create_curve_tube("HCT_Dish_Feed_Arm", [feed_start, feed_end], 0.065, materials["dark"], coll)
    add_cylinder("HCT_Dish_Feed", feed_end, 0.15, 0.40, materials["dark"], coll, vertices=12)

    # Tripod legs.
    for i, a in enumerate((0, 2.1, 4.2)):
        foot = (dish_x + 1.3*math.cos(a), dish_y + 1.3*math.sin(a), terrain_height(dish_x + 1.3*math.cos(a), dish_y + 1.3*math.sin(a), 0.08) + 0.15)
        create_curve_tube(f"HCT_Dish_Leg_{i}", [(dish_x, dish_y, dish_z-1.15), foot], 0.065, materials["dark"], coll)

    # Solar-panel group close to western service body.
    panel_base_x = gx - 11.7
    panel_base_y = gy + 8.4
    panel_z = gz + 4.9
    for i in range(4):
        add_cube(
            f"HCT_Solar_Panel_{i:02d}",
            (panel_base_x + i*2.65, panel_base_y, panel_z + 0.35),
            (2.4, 4.0, 0.10),
            materials["panel"], coll,
            rotation=(math.radians(20), 0, 0),
            bevel=0.04,
        )

    # Restore contextual observatory structures requested by the user.
    # They are deliberately secondary and labeled as approximate context.
    create_context_dome("HCT_Aux_Context_A", -60.0, 45.0, 0.92, materials, coll)
    create_context_dome("HCT_Aux_Context_B", -33.0, 53.0, 0.62, materials, coll)

    # Small non-dome utility building between HCT and context structures.
    ux, uy = -39.0, 31.0
    uz = terrain_height(ux, uy, detail=0.15)
    add_cube(
        "HCT_Context_Utility_Pad",
        (ux, uy, uz - 0.08),
        (14.0, 10.0, 0.42),
        materials["platform"], coll, bevel=1.0,
    )
    add_cube(
        "HCT_Context_Utility_Building",
        (ux, uy, uz + 1.9),
        (10.0, 6.5, 3.8),
        materials["facility"], coll, bevel=0.12,
    )
    add_cube(
        "HCT_Context_Utility_Roof",
        (ux, uy, uz + 3.95),
        (10.8, 7.2, 0.20),
        materials["dark"], coll, bevel=0.06,
    )


# ----------------------------------------------------------------
# WORLD / LIGHTING
# ----------------------------------------------------------------

def create_cloud_cluster(name, center, scale, material, coll, count=5):
    """
    Very sparse distant cloud cluster for depth.
    Intentionally lightweight and subordinate to the clear Hanle sky.
    """
    cx, cy, cz = center
    for i in range(count):
        ox = (i - (count-1)/2.0) * scale[0] * 0.34
        oy = random.uniform(-0.6,0.6) * scale[1]
        oz = random.uniform(-0.25,0.30) * scale[2]
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=12,
            location=(cx+ox, cy+oy, cz+oz),
        )
        cloud = bpy.context.active_object
        cloud.name = f"{name}_{i:02d}"
        cloud.scale = (
            scale[0]*random.uniform(0.60,1.05),
            scale[1]*random.uniform(0.65,1.15),
            scale[2]*random.uniform(0.55,1.10),
        )
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_material(cloud, material)
        move_to_collection(cloud, coll)
        for p in cloud.data.polygons:
            p.use_smooth = True


def create_world_and_lighting(coll, materials=None):
    """
    V7 high-altitude daylight:
      deeper blue zenith, clearer horizon, low dust,
      crisp sunlight and only a few distant cloud groups.
    """
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"

    world = bpy.data.worlds.get("HCT_Hanle_Daylight") or bpy.data.worlds.new("HCT_Hanle_Daylight")
    world.use_nodes = True
    scene.world = world
    nt = world.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "NISHITA"
    sky.sun_elevation = math.radians(39.0)
    sky.sun_rotation = math.radians(224.0)
    sky.altitude = 4500.0
    sky.air_density = 0.44
    sky.dust_density = 0.075
    sky.ozone_density = 1.10
    bg.inputs["Strength"].default_value = 0.48
    nt.links.new(sky.outputs["Color"], bg.inputs["Color"])
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

    sun_data = bpy.data.lights.new("HCT_Sun", "SUN")
    sun_data.energy = 3.15
    sun_data.angle = math.radians(1.8)
    sun = bpy.data.objects.new("HCT_Sun", sun_data)
    coll.objects.link(sun)
    sun.rotation_euler = (
        math.radians(33),
        math.radians(-17),
        math.radians(-43),
    )

    area_data = bpy.data.lights.new("HCT_Sky_Fill", "AREA")
    area_data.energy = 300
    area_data.shape = "DISK"
    area_data.size = 68
    area = bpy.data.objects.new("HCT_Sky_Fill", area_data)
    coll.objects.link(area)
    area.location = (-48,-60,75)
    look_at(area, (FACILITY_X,FACILITY_Y,10))

    if materials is not None:
        # Only a few distant cloud groups; no cartoon cloud-filled sky.
        create_cloud_cluster("HCT_Cloud_West", (-145, 120, 78), (10,5,2.1), materials["cloud"], coll, 4)
        create_cloud_cluster("HCT_Cloud_North", (55, 185, 92), (13,5.5,2.4), materials["cloud"], coll, 5)
        create_cloud_cluster("HCT_Cloud_East", (170, 85, 82), (9,4.5,1.8), materials["cloud"], coll, 4)

    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except Exception:
        pass


# ----------------------------------------------------------------
# QA CAMERAS
# ----------------------------------------------------------------

def create_camera(name, location, target, lens, coll):
    data = bpy.data.cameras.new(f"{name}_Data")
    data.lens = lens
    data.sensor_width = 36
    data.clip_start = 0.10
    data.clip_end = 2500.0
    cam = bpy.data.objects.new(name, data)
    coll.objects.link(cam)
    cam.location = location
    look_at(cam, target)
    return cam


def create_qa_cameras(f, coll):
    x,y,z = f["x"],f["y"],f["z"]
    target = (f["cx"],f["cy"],f["target_z"])

    cams = {}

    # Lower switchback camera — must show repeated bends and climb.
    cams["approach"] = create_camera(
        "HCT_QA_01_SWITCHBACK_APPROACH",
        (-104,-91, terrain_height(-104,-91,0.06)+7.0),
        (4,1,z+9.0), 48, coll,
    )

    # HCT hero view from just below the engineered plateau.
    cams["hero"] = create_camera(
        "HCT_QA_02_FACILITY_HERO",
        (-5,-26, terrain_height(-5,-26,0.08)+7.0),
        target, 55, coll,
    )

    # Low rocky road reveal.
    cams["low"] = create_camera(
        "HCT_QA_03_ROAD_LOW_REVEAL",
        (-48,-35, terrain_height(-48,-35,0.08)+3.0),
        (8,-2,z+5.0), 47, coll,
    )

    # Rear / service apron.
    cams["rear"] = create_camera(
        "HCT_QA_04_REAR_SERVICE",
        (x+42,y+32, terrain_height(x+42,y+32,0.10)+11.0),
        (x+2,y+4,z+7.5), 50, coll,
    )

    # Elevated campus overview: road, plateau, context buildings.
    cams["overview"] = create_camera(
        "HCT_QA_05_ENGINEERED_SITE_OVERVIEW",
        (-76,18, terrain_height(-76,18,0.10)+43.0),
        (x-9,y+6,z+5.5), 49, coll,
    )

    # Broad lower-valley view for mountain-road hierarchy.
    cams["valley"] = create_camera(
        "HCT_QA_06_VALLEY_TO_SUMMIT",
        (-132,-124, terrain_height(-132,-124,0.05)+11.0),
        (x-8,y,z+9.0), 57, coll,
    )

    bpy.context.scene.camera = cams["approach"]
    return cams


# ----------------------------------------------------------------
# BUILD / SAVE
# ----------------------------------------------------------------

def build_world():
    print("\n" + "="*72)
    print("DIYA ASTRA — HCT FINAL V7.1 ROAD / GROUNDING POLISH")
    print("SCRIPT SIGNATURE:", SCRIPT_SIGNATURE)
    print("="*72)

    clear_scene()
    root = create_collection(WORLD_COLLECTION_NAME)
    site = create_collection(SITE_COLLECTION_NAME, root)
    facility = create_collection(FACILITY_COLLECTION_NAME, root)
    road = create_collection(ROAD_COLLECTION_NAME, root)
    scatter = create_collection(SCATTER_COLLECTION_NAME, root)
    infra = create_collection(INFRA_COLLECTION_NAME, root)
    lights = create_collection(LIGHT_COLLECTION_NAME, root)
    cams = create_collection(CAMERA_COLLECTION_NAME, root)

    mats = build_materials()

    print("1/7 continuous Hanle terrain...")
    create_continuous_terrain(mats["terrain"], site)

    print("2/7 HCT facility / dome / balcony...")
    f = create_facility(mats, facility)

    print("3/7 final road continuity + grounded summit terrace + terrain-hugging auxiliary access...")
    create_road(mats, road)

    print("4/7 road-edge stones + rocky scatter + sparse alpine scrub...")
    create_scatter(mats, scatter)

    print("5/7 communications / solar / restored context structures...")
    create_infrastructure(mats, f, infra)

    print("6/7 high-altitude daylight...")
    create_world_and_lighting(lights, mats)

    print("7/7 QA cameras...")
    create_qa_cameras(f, cams)

    print("\nV7 SITE-ENGINEERING STATUS")
    print("  continuous Hanle terrain                    : PRESERVED")
    print("  repeated switchback mountain road           : PRESERVED / CONTINUITY FIXED")
    print("  physical road depth / coarse foundation     : ADDED")
    print("  stone retaining walls only where exposed    : ADDED")
    print("  irregular road-edge stones                  : ADDED")
    print("  stable concrete HCT summit platform          : GROUNDED / FOUNDATION ADDED")
    print("  concrete arrival / east / rear service areas: ADDED")
    print("  no decorative circular road around HCT      : YES")
    print("  auxiliary gravel access                     : TERRAIN-HUGGING / ELEVATION FIXED")
    print("  contextual observatory buildings            : PRESERVED")
    print("  sparse high-altitude scrub                   : IMPROVED")
    print("  deeper clear Hanle sky + sparse clouds       : IMPROVED")
    print("  HCT facility / dome / balcony                : PRESERVED V6")
    print("  QA cameras                                   : 6 UPDATED")
    print("\nNOTE: reference-driven visualization, not survey/GIS geometry.")
    print("Dish = communications infrastructure, NOT HFOSC.")
    print("="*72)


def save_current_blend():
    path = bpy.data.filepath
    if path:
        bpy.ops.wm.save_as_mainfile(filepath=path)
        print("BLEND SAVED:", path)
    else:
        print("WARNING: current Blender file has no filepath; scene not auto-saved.")


def main():
    build_world()
    save_current_blend()
    print("\nHCT FINAL V7.1 ROAD / GROUNDING POLISH BUILD FINISHED")
    print("Next: Material Preview + Rendered QA using HCT_QA_01..06 cameras.")


if __name__ == "__main__":
    main()