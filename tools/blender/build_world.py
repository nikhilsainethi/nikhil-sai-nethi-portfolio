"""Build the portfolio's 3D world and export it as glTF.

Run headless (see `npm run model`):

    blender -b --factory-startup --python tools/blender/build_world.py -- \
        --out world.raw.glb [--preview-dir DIR] [--samples 192]

Everything is generated from code, so the model is reproducible and reviewable.
It is an original, synthetic place: it is not modelled on any real facility.

The world is one continuous route that the page's camera follows on scroll:

  cold aisle -> sliding doors -> tunnel -> the core (a tall silo of cabinets
  around a glowing spine, with four exhibit platforms) -> rooftop

Dimensions shared with the web code live in world-layout.json.

Lighting is baked by Cycles into per-corner vertex colours (COLOR_0) as plain
irradiance, so the page needs no lightmap textures and no real-time shadows.
Anything that glows or animates is exported in separate "...Glow" objects and
given its real material in Three.js.

Blender axes: X across the aisle, Y down the aisle, Z up. glTF export is Y-up.
"""

import argparse
import json
import math
import os
import random
import sys
from contextlib import contextmanager

import addon_utils
import bmesh
import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "world-layout.json"), encoding="utf-8") as handle:
    LAYOUT = json.load(handle)

AISLE, TUNNEL, CORE, ROOF = LAYOUT["aisle"], LAYOUT["tunnel"], LAYOUT["core"], LAYOUT["roof"]

# ---------------------------------------------------------------- parameters
RACK_W, RACK_D, RACK_H = AISLE["rackWidth"], AISLE["rackDepth"], AISLE["rackHeight"]
PITCH = AISLE["rackPitch"]
RACKS_PER_SIDE = AISLE["racksPerSide"]
ROW_START_Y = AISLE["rowStartY"]
AISLE_HALF = AISLE["halfWidth"]
ROOM_HALF_X = AISLE["roomHalfX"]
ROOM_Y0, ROOM_Y1 = AISLE["roomY0"], AISLE["roomY1"]
CEILING_Z = AISLE["ceiling"]
DOOR_HALF, DOOR_H = AISLE["doorHalf"], AISLE["doorHeight"]
TILE = 0.6
U = 0.04445             # one rack unit
UNITS_Z0 = 0.13
BEZEL_HALF = 0.2225
FRONT_Y = 0.03          # bezel front plane, in cabinet-local space (front faces -Y)
ROW_END_Y = ROW_START_Y + (RACKS_PER_SIDE - 1) * PITCH + PITCH / 2

TUNNEL_Y0 = ROOM_Y1
TUNNEL_Y1 = TUNNEL_Y0 + TUNNEL["length"]
CORE_R = CORE["radius"]
CORE_CENTRE = Vector((0.0, TUNNEL_Y1 + CORE_R, 0.0))
TIER_H = CORE["tierHeight"]
TIER_MIN, TIER_MAX = CORE["tierMin"], CORE["tierMax"]
SECTORS = CORE["sectors"]
SECTOR_ANGLE = 2 * math.pi / SECTORS
PIT_Z = TIER_MIN * TIER_H
ROOF_UNDER, ROOF_TOP = ROOF["underside"], ROOF["top"]
OCULUS_R = ROOF["oculusRadius"]
TAU = 2 * math.pi

LED_GREEN = (0.45, 1.0, 0.42)
LED_CYAN = (0.25, 0.95, 1.0)
LED_AMBER = (1.0, 0.62, 0.18)
LED_WHITE = (0.85, 1.0, 0.95)

# name -> (base colour, metallic, roughness, emission colour, emission strength)
MATERIALS = {
    "rack_body":   ((0.030, 0.038, 0.046), 0.75, 0.48, None, 0),
    "rack_bezel":  ((0.070, 0.085, 0.098), 0.80, 0.38, None, 0),
    "rack_vent":   ((0.006, 0.008, 0.010), 0.20, 0.85, None, 0),
    "rack_accent": ((0.240, 0.290, 0.310), 0.90, 0.30, None, 0),
    "floor_tile":  ((0.050, 0.062, 0.070), 0.10, 0.22, None, 0),
    "floor_vent":  ((0.012, 0.016, 0.019), 0.30, 0.60, None, 0),
    "room_dark":   ((0.030, 0.038, 0.045), 0.00, 0.85, None, 0),
    "room_panel":  ((0.055, 0.070, 0.080), 0.00, 0.70, None, 0),
    "tray_metal":  ((0.110, 0.135, 0.150), 0.85, 0.42, None, 0),
    "cable_dark":  ((0.012, 0.014, 0.017), 0.00, 0.65, None, 0),
    "cable_teal":  ((0.020, 0.300, 0.290), 0.00, 0.55, None, 0),
    "cable_amber": ((0.550, 0.250, 0.040), 0.00, 0.55, None, 0),
    "tunnel_wall": ((0.040, 0.048, 0.056), 0.55, 0.50, None, 0),
    "tunnel_floor": ((0.022, 0.027, 0.032), 0.40, 0.45, None, 0),
    "core_wall":   ((0.030, 0.036, 0.044), 0.00, 0.80, None, 0),
    "core_deck":   ((0.065, 0.078, 0.088), 0.60, 0.45, None, 0),
    "core_rail":   ((0.210, 0.250, 0.270), 0.85, 0.35, None, 0),
    "core_rack":   ((1.000, 1.000, 1.000), 0.30, 0.50, None, 0),   # colour comes from the bake
    "spine_body":  ((0.050, 0.056, 0.064), 0.70, 0.42, None, 0),
    "roof_slab":   ((0.050, 0.056, 0.062), 0.00, 0.90, None, 0),
    "roof_unit":   ((0.120, 0.135, 0.145), 0.50, 0.50, None, 0),
    # things that glow
    "light_strip": ((0.9, 0.9, 0.9), 0.0, 0.5, (0.72, 0.93, 1.00), 14.0),
    "footlight":   ((0.5, 0.9, 0.8), 0.0, 0.5, (0.45, 1.00, 0.84), 2.2),
    "door_light":  ((0.9, 1.0, 0.9), 0.0, 0.5, (0.78, 1.00, 0.86), 9.0),
    "led":         ((1.0, 1.0, 1.0), 0.0, 0.5, (0.60, 1.00, 0.80), 4.0),
    "tunnel_ring": ((1.0, 1.0, 1.0), 0.0, 0.5, (0.62, 0.95, 1.00), 7.0),
    "core_ring":   ((1.0, 1.0, 1.0), 0.0, 0.5, (0.74, 0.88, 1.00), 6.0),
    "core_edge":   ((1.0, 1.0, 1.0), 0.0, 0.5, (0.32, 1.00, 0.84), 2.4),
    "spine_flow":  ((1.0, 1.0, 1.0), 0.0, 0.5, (1.00, 0.76, 0.42), 9.0),
    "pit_pool":    ((1.0, 1.0, 1.0), 0.0, 0.5, (0.08, 0.55, 0.66), 1.6),
    "screen":      ((1.0, 1.0, 1.0), 0.0, 0.5, (0.36, 0.92, 0.84), 2.6),
    "gate":        ((1.0, 1.0, 1.0), 0.0, 0.5, (0.60, 1.00, 0.56), 5.0),
    "cloud_block": ((1.0, 1.0, 1.0), 0.0, 0.5, (0.50, 0.76, 1.00), 1.4),
    "mast_light":  ((1.0, 1.0, 1.0), 0.0, 0.5, (1.00, 0.16, 0.10), 6.0),
    "roof_line":   ((1.0, 1.0, 1.0), 0.0, 0.5, (0.30, 0.92, 0.80), 1.6),
    "warm_light":  ((1.0, 1.0, 1.0), 0.0, 0.5, (1.00, 0.72, 0.42), 7.0),
}
for index, platform in enumerate(CORE["platforms"]):
    MATERIALS[f"platform_edge_{index + 1}"] = ((1.0, 1.0, 1.0), 0.0, 0.5, tuple(platform["accent"]), 4.0)


def pol(r, a, z=0.0):
    """Polar point about the local origin. Angle 0 points to -Y (back towards the tunnel)."""
    return (r * math.sin(a), -r * math.cos(a), z)


def station(angle, radius, z=0.0):
    """Local frame on a circle: origin on the circle, +Y outwards, +X to the right when looking out."""
    return Matrix.Translation(Vector(pol(radius, angle, z))) @ Matrix.Rotation(angle + math.pi, 4, "Z")


# ------------------------------------------------------------------- helpers
class Builder:
    """Accumulates boxes, quads, arcs and beams into one mesh.

    Every solid is wound correctly whatever transform is active: faces are
    flipped to point away from the solid's own centre (or towards / away from
    a given point for single quads).
    """

    ALL = ("-x", "+x", "-y", "+y", "-z", "+z")

    def __init__(self, name, materials, layers=False):
        self.name = name
        self.materials = list(materials)
        self.bm = bmesh.new()
        self.matrix = Matrix.Identity(4)
        self.color_layer = self.bm.loops.layers.float_color.new("Col") if layers else None
        self.uv_layer = self.bm.loops.layers.uv.new("UVMap") if layers else None
        self.albedo_layer = None

    def enable_albedo(self):
        self.albedo_layer = self.bm.loops.layers.float_color.new("Albedo")

    @contextmanager
    def at(self, matrix):
        previous = self.matrix
        self.matrix = previous @ matrix
        try:
            yield
        finally:
            self.matrix = previous

    def _world(self, point):
        return self.matrix @ Vector(point)

    def _vert(self, point):
        return self.bm.verts.new(self._world(point))

    def _face(self, verts, material, outward_from=None, toward=None, away=None, color=None, uvs=None):
        face = self.bm.faces.new(verts)
        face.material_index = self.materials.index(material)
        face.normal_update()
        centre = face.calc_center_median()
        if outward_from is not None and (centre - outward_from).dot(face.normal) < 0:
            face.normal_flip()
        if toward is not None and (toward - centre).dot(face.normal) < 0:
            face.normal_flip()
        if away is not None and (away - centre).dot(face.normal) > 0:
            face.normal_flip()
        if self.color_layer is not None:
            for i, loop in enumerate(face.loops):
                loop[self.color_layer] = (*(color or (1.0, 1.0, 1.0)), 1.0)
                loop[self.uv_layer].uv = uvs[i] if uvs else (0.0, 0.0)
        if self.albedo_layer is not None:
            base = MATERIALS[material][0]
            for loop in face.loops:
                loop[self.albedo_layer] = (*base, 1.0)
        return face

    def _solid(self, corners, quads, material):
        """corners: key -> local point. quads: lists of keys."""
        verts = {key: self._vert(point) for key, point in corners.items()}
        centre = sum((v.co for v in verts.values()), Vector()) / len(verts)
        for quad in quads:
            self._face([verts[key] for key in quad], material, outward_from=centre)

    def box(self, lo, hi, material, faces=ALL):
        x0, y0, z0 = lo
        x1, y1, z1 = hi
        assert x1 > x0 and y1 > y0 and z1 > z0, (self.name, lo, hi)
        corners = {(i, j, k): ((x0, x1)[i], (y0, y1)[j], (z0, z1)[k]) for i in (0, 1) for j in (0, 1) for k in (0, 1)}
        table = {
            "+z": ((0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)),
            "-z": ((0, 0, 0), (0, 1, 0), (1, 1, 0), (1, 0, 0)),
            "-y": ((0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)),
            "+y": ((0, 1, 0), (0, 1, 1), (1, 1, 1), (1, 1, 0)),
            "+x": ((1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1)),
            "-x": ((0, 0, 0), (0, 0, 1), (0, 1, 1), (0, 1, 0)),
        }
        self._solid(corners, [table[key] for key in faces], material)

    def quad(self, points, material, toward=None, away=None, color=None, uvs=None):
        """A single face. `toward` / `away` (local points) say which way it must look."""
        return self._face(
            [self._vert(p) for p in points], material,
            toward=self._world(toward) if toward is not None else None,
            away=self._world(away) if away is not None else None,
            color=color, uvs=uvs,
        )

    def front_quad(self, x0, x1, z0, z1, y, material, color=None, uvs=None):
        """A quad facing -Y (towards the viewer of a cabinet front)."""
        return self.quad(
            ((x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)), material,
            toward=((x0 + x1) / 2, y - 1.0, (z0 + z1) / 2), color=color, uvs=uvs,
        )

    def led(self, x, z, color, mode, rng, w=0.009, h=0.005, y=None):
        phase = rng.random()
        y = FRONT_Y - 0.0015 if y is None else y
        self.front_quad(x - w / 2, x + w / 2, z - h / 2, z + h / 2, y, "led", color=color, uvs=[(mode, phase)] * 4)

    def prism_y(self, x, z, radius, y0, y1, material, sides=6):
        rings = [[self._vert((x + radius * math.cos(TAU * i / sides), y, z + radius * math.sin(TAU * i / sides)))
                  for i in range(sides)] for y in (y0, y1)]
        axis = self._world((x, (y0 + y1) / 2, z))
        for i in range(sides):
            j = (i + 1) % sides
            self._face([rings[0][i], rings[1][i], rings[1][j], rings[0][j]], material, outward_from=axis)

    def beam(self, p0, p1, width, material, height=None, ends=True):
        """A box running from p0 to p1."""
        p0, p1 = Vector(p0), Vector(p1)
        along = (p1 - p0).normalized()
        reference = Vector((0, 0, 1)) if abs(along.z) < 0.9 else Vector((1, 0, 0))
        a = along.cross(reference).normalized()
        b = along.cross(a).normalized()
        hw, hh = width / 2, (height or width) / 2
        corners = {(e, i, j): (p0, p1)[e] + a * hw * (-1, 1)[i] + b * hh * (-1, 1)[j]
                   for e in (0, 1) for i in (0, 1) for j in (0, 1)}
        quads = [((0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0)), ((0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)),
                 ((0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)), ((0, 1, 0), (1, 1, 0), (1, 1, 1), (0, 1, 1))]
        if ends:
            quads += [((0, 0, 0), (0, 1, 0), (0, 1, 1), (0, 0, 1)), ((1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1))]
        self._solid(corners, quads, material)

    def arc_box(self, r0, r1, a0, a1, z0, z1, material, segs=4, faces=("top", "bottom", "inner", "outer", "start", "end")):
        """An annular sector, as a row of wedges."""
        for i in range(segs):
            b0 = a0 + (a1 - a0) * i / segs
            b1 = a0 + (a1 - a0) * (i + 1) / segs
            corners = {(ri, ai, zi): pol((r0, r1)[ri], (b0, b1)[ai], (z0, z1)[zi])
                       for ri in (0, 1) for ai in (0, 1) for zi in (0, 1)}
            quads = []
            if "top" in faces:
                quads.append(((0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)))
            if "bottom" in faces:
                quads.append(((0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0)))
            if "inner" in faces:
                quads.append(((0, 0, 0), (0, 1, 0), (0, 1, 1), (0, 0, 1)))
            if "outer" in faces:
                quads.append(((1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1)))
            if "start" in faces and i == 0:
                quads.append(((0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)))
            if "end" in faces and i == segs - 1:
                quads.append(((0, 1, 0), (1, 1, 0), (1, 1, 1), (0, 1, 1)))
            self._solid(corners, quads, material)

    def tube(self, radius, z0, z1, material, segs=24, a0=0.0, a1=TAU, inward=False, zsegs=1, color=None, uvs=False):
        """The side of a cylinder about the local Z axis."""
        for k in range(zsegs):
            za = z0 + (z1 - z0) * k / zsegs
            zb = z0 + (z1 - z0) * (k + 1) / zsegs
            for i in range(segs):
                b0 = a0 + (a1 - a0) * i / segs
                b1 = a0 + (a1 - a0) * (i + 1) / segs
                axis = (0.0, 0.0, (za + zb) / 2)
                uv = [((b0 - a0) / (a1 - a0), k / zsegs), ((b1 - a0) / (a1 - a0), k / zsegs),
                      ((b1 - a0) / (a1 - a0), (k + 1) / zsegs), ((b0 - a0) / (a1 - a0), (k + 1) / zsegs)] if uvs else None
                self.quad((pol(radius, b0, za), pol(radius, b1, za), pol(radius, b1, zb), pol(radius, b0, zb)), material,
                          toward=axis if inward else None, away=None if inward else axis, color=color, uvs=uv)

    def ring(self, r0, r1, z, material, segs=24, up=True, a0=0.0, a1=TAU, bands=1, color=None, uvs=False):
        """A flat annulus (or annular sector)."""
        for band in range(bands):
            ra = r0 + (r1 - r0) * band / bands
            rb = r0 + (r1 - r0) * (band + 1) / bands
            for i in range(segs):
                b0 = a0 + (a1 - a0) * i / segs
                b1 = a0 + (a1 - a0) * (i + 1) / segs
                mid = pol((ra + rb) / 2, (b0 + b1) / 2, z + (1.0 if up else -1.0))
                uv = [(ra / r1, 0.0), (rb / r1, 0.0), (rb / r1, 1.0), (ra / r1, 1.0)] if uvs else None
                self.quad((pol(ra, b0, z), pol(rb, b0, z), pol(rb, b1, z), pol(ra, b1, z)), material, toward=mid, color=color, uvs=uv)

    def disc_facing(self, centre, normal, radius, thickness, material, segs=14):
        """A short cylinder whose flat faces look along `normal`."""
        centre, normal = Vector(centre), Vector(normal).normalized()
        reference = Vector((0, 0, 1)) if abs(normal.z) < 0.9 else Vector((1, 0, 0))
        a = normal.cross(reference).normalized()
        b = normal.cross(a).normalized()
        rings = [[self._vert(centre + normal * offset + (a * math.cos(TAU * i / segs) + b * math.sin(TAU * i / segs)) * radius)
                  for i in range(segs)] for offset in (-thickness / 2, thickness / 2)]
        middle = self._world(centre)
        self._face(rings[0], material, outward_from=middle)
        self._face(rings[1], material, outward_from=middle)
        for i in range(segs):
            j = (i + 1) % segs
            self._face([rings[0][i], rings[1][i], rings[1][j], rings[0][j]], material, outward_from=middle)

    def finish(self, collection, location=(0.0, 0.0, 0.0)):
        loose = [v for v in self.bm.verts if not v.link_faces]
        bmesh.ops.delete(self.bm, geom=loose, context="VERTS")
        self.bm.normal_update()
        mesh = bpy.data.meshes.new(self.name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        for material in self.materials:
            mesh.materials.append(bpy.data.materials[material])
        if "Col" in mesh.color_attributes:  # LED / glow colours: make them the exported COLOR_0
            mesh.color_attributes.active_color = mesh.color_attributes["Col"]
            mesh.color_attributes.render_color_index = list(mesh.color_attributes).index(mesh.color_attributes["Col"])
        obj = bpy.data.objects.new(self.name, mesh)
        obj.location = location
        collection.objects.link(obj)
        return obj


def make_materials():
    for name, (base, _metallic, roughness, emission, strength) in MATERIALS.items():
        material = bpy.data.materials.new(name)
        material.use_nodes = True
        material.use_backface_culling = True  # exported as single-sided
        bsdf = material.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = (*base, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.0  # set after the diffuse bake
        bsdf.inputs["Roughness"].default_value = roughness
        if emission:
            bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
            bsdf.inputs["Emission Strength"].default_value = strength
    # The low-detail core cabinets get their surface colour from the bake, so
    # light them as a mid-grey surface while baking.
    bpy.data.materials["core_rack"].node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.06, 0.07, 0.08, 1.0)


def apply_final_materials():
    for name, (base, metallic, *_rest) in MATERIALS.items():
        bsdf = bpy.data.materials[name].node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Metallic"].default_value = metallic
        if name != "core_rack":  # keeps its grey for the preview renders; Three.js sets the real factor
            bsdf.inputs["Base Color"].default_value = (*base, 1.0)


def frange(start, stop, step):
    out, value = [], start
    while value < stop - 1e-6:
        out.append(round(value, 5))
        value += step
    return out


# ------------------------------------------------------------------ cabinets
FRONT5 = ("-x", "+x", "-y", "-z", "+z")  # everything except the hidden back


def unit_server(b, leds, z, rng, height_u=1):
    h = height_u * U - 0.003
    b.box((-BEZEL_HALF, FRONT_Y, z), (BEZEL_HALF, FRONT_Y + 0.02, z + h), "rack_bezel", FRONT5)
    for side in (-1, 1):  # ears / handles
        x = side * (BEZEL_HALF - 0.012)
        b.box((x - 0.008, FRONT_Y - 0.012, z + 0.006), (x + 0.008, FRONT_Y, z + h - 0.006), "rack_accent", FRONT5)
    leds.led(-BEZEL_HALF + 0.040, z + h * 0.68, LED_GREEN, 0.0, rng)
    leds.led(-BEZEL_HALF + 0.056, z + h * 0.68, LED_CYAN if rng.random() < 0.7 else LED_AMBER, 1.0, rng)
    leds.led(-BEZEL_HALF + 0.040, z + h * 0.32, LED_GREEN, 0.5, rng)
    gx0, gx1 = -BEZEL_HALF + 0.075, 0.05  # vent grille: dark recess with slats
    b.front_quad(gx0, gx1, z + 0.006, z + h - 0.006, FRONT_Y - 0.0006, "rack_vent")
    slats = 3 * height_u
    for i in range(slats):
        sz = z + 0.008 + (h - 0.016) * (i + 0.5) / slats
        b.box((gx0, FRONT_Y - 0.004, sz - 0.0022), (gx1, FRONT_Y, sz + 0.0022), "rack_bezel", ("-y", "+z", "-z"))
    cols, rows = 4, height_u  # drive caddies
    cx0, cx1 = 0.062, BEZEL_HALF - 0.03
    cw = (cx1 - cx0) / cols
    ch = (h - 0.008) / rows
    for r in range(rows):
        for c in range(cols):
            x0 = cx0 + c * cw
            z0 = z + 0.004 + r * ch
            b.box((x0 + 0.002, FRONT_Y - 0.005, z0 + 0.002), (x0 + cw - 0.002, FRONT_Y, z0 + ch - 0.002), "rack_body", FRONT5)
            if rng.random() < 0.8:
                leds.led(x0 + cw - 0.008, z0 + 0.008, LED_CYAN if rng.random() < 0.6 else LED_GREEN, 1.0, rng, 0.006, 0.004)


def unit_storage(b, leds, z, rng, height_u=2):
    h = height_u * U - 0.003
    b.box((-BEZEL_HALF, FRONT_Y, z), (BEZEL_HALF, FRONT_Y + 0.02, z + h), "rack_vent", FRONT5)
    cols, rows = 6, height_u
    cw = (2 * BEZEL_HALF - 0.03) / cols
    ch = (h - 0.006) / rows
    for r in range(rows):
        for c in range(cols):
            x0 = -BEZEL_HALF + 0.015 + c * cw
            z0 = z + 0.003 + r * ch
            b.box((x0 + 0.002, FRONT_Y - 0.006, z0 + 0.002), (x0 + cw - 0.002, FRONT_Y, z0 + ch - 0.002), "rack_bezel", FRONT5)
            b.front_quad(x0 + 0.008, x0 + cw - 0.018, z0 + ch * 0.3, z0 + ch * 0.7, FRONT_Y - 0.0066, "rack_vent")
            leds.led(x0 + cw - 0.009, z0 + ch - 0.009, LED_GREEN if rng.random() < 0.85 else LED_AMBER,
                     1.0 if rng.random() < 0.6 else 0.0, rng, 0.006, 0.004)
    for side in (-1, 1):
        x = side * (BEZEL_HALF - 0.006)
        b.box((x - 0.005, FRONT_Y - 0.012, z + 0.004), (x + 0.005, FRONT_Y, z + h - 0.004), "rack_accent", FRONT5)


def unit_switch(b, leds, z, rng):
    h = U - 0.003
    b.box((-BEZEL_HALF, FRONT_Y, z), (BEZEL_HALF, FRONT_Y + 0.02, z + h), "rack_body", FRONT5)
    ports = 24
    span = 2 * BEZEL_HALF - 0.09
    pw = span / ports
    for p in range(ports):
        x0 = -BEZEL_HALF + 0.03 + p * pw
        b.front_quad(x0 + 0.0015, x0 + pw - 0.0015, z + 0.006, z + h * 0.62, FRONT_Y - 0.0006, "rack_vent")
        if rng.random() < 0.78:
            leds.led(x0 + pw / 2, z + h * 0.80, LED_GREEN if rng.random() < 0.7 else LED_AMBER, 1.0, rng, 0.006, 0.0035)
    leds.led(BEZEL_HALF - 0.035, z + h * 0.5, LED_CYAN, 0.5, rng)


def unit_blank(b, z, height_u=1):
    h = height_u * U - 0.003
    b.box((-BEZEL_HALF, FRONT_Y + 0.004, z), (BEZEL_HALF, FRONT_Y + 0.02, z + h), "rack_body", FRONT5)


def unit_cable_manager(b, z):
    h = U - 0.003
    b.box((-BEZEL_HALF, FRONT_Y, z), (BEZEL_HALF, FRONT_Y + 0.02, z + h), "rack_bezel", FRONT5)
    b.front_quad(-BEZEL_HALF + 0.03, BEZEL_HALF - 0.03, z + h * 0.3, z + h * 0.7, FRONT_Y - 0.0006, "rack_vent")


def build_rack(variant, seed, collection):
    rng = random.Random(seed)
    b = Builder(f"Rack.{variant}", ["rack_body", "rack_bezel", "rack_vent", "rack_accent"])
    leds = Builder(f"RackLeds.{variant}", ["led"], layers=True)
    hw = RACK_W / 2
    b.box((-hw, 0.0, 0.0), (-hw + 0.014, RACK_D, RACK_H), "rack_body")
    b.box((hw - 0.014, 0.0, 0.0), (hw, RACK_D, RACK_H), "rack_body")
    b.box((-hw + 0.014, 0.0, RACK_H - 0.035), (hw - 0.014, RACK_D, RACK_H), "rack_body", ("-y", "+y", "+z", "-z"))
    b.box((-hw + 0.014, 0.012, 0.0), (hw - 0.014, RACK_D, 0.085), "rack_vent", ("-y", "+z"))
    b.box((-hw + 0.014, RACK_D - 0.012, 0.085), (hw - 0.014, RACK_D, RACK_H - 0.035), "rack_body", ("-y", "+y"))
    b.front_quad(-hw + 0.014, hw - 0.014, 0.085, RACK_H - 0.035, FRONT_Y + 0.045, "rack_vent")  # dark interior
    for side in (-1, 1):  # mounting rails
        x = side * 0.2405
        b.box((x - 0.015, FRONT_Y - 0.004, 0.10), (x + 0.015, FRONT_Y + 0.02, RACK_H - 0.05), "rack_accent", FRONT5)
    b.box((-hw + 0.014, 0.004, UNITS_Z0 + 42 * U + 0.006), (hw - 0.014, 0.03, RACK_H - 0.035), "rack_bezel", ("-y", "-z"))
    leds.led(0.0, RACK_H - 0.075, LED_WHITE, 0.0, rng, 0.30, 0.007)  # header status bar
    recipes = {
        "A": [("server", 1)] * 6 + [("server", 2)] * 2 + [("blank", 1), ("storage", 2), ("server", 1), ("switch", 1)],
        "B": [("switch", 1), ("cable", 1), ("server", 1), ("server", 1), ("server", 2), ("storage", 2), ("blank", 2), ("server", 1)],
        "C": [("storage", 2)] * 4 + [("storage", 4), ("server", 1), ("server", 2), ("blank", 1), ("switch", 1), ("cable", 1)],
    }[variant]
    z, used = UNITS_Z0, 0
    while used < 42:
        kind, units = rng.choice(recipes)
        if used + units > 42:
            kind, units = "blank", 42 - used
        if kind == "server":
            unit_server(b, leds, z, rng, units)
        elif kind == "storage":
            unit_storage(b, leds, z, rng, units)
        elif kind == "switch":
            unit_switch(b, leds, z, rng)
        elif kind == "cable":
            unit_cable_manager(b, z)
        else:
            unit_blank(b, z, units)
        z += units * U
        used += units
    return b.finish(collection), leds.finish(collection)


# ---------------------------------------------------------------- cold aisle
def build_floor(collection):
    b = Builder("Floor", ["floor_tile", "floor_vent"])
    rng = random.Random(7)
    gap = 0.003
    for x in frange(-ROOM_HALF_X, ROOM_HALF_X, TILE):
        for y in frange(ROOM_Y0, ROOM_Y1, TILE):
            b.box((x + gap, y + gap, -0.03), (x + TILE - gap, y + TILE - gap, 0.0), "floor_tile", ("+z", "-x", "+x", "-y", "+y"))
            if abs(x + TILE / 2) < 0.7 and rng.random() < 0.3:  # perforated airflow tile
                n = 6
                cell = (TILE - 0.12) / n
                for i in range(n):
                    for j in range(n):
                        cx = x + 0.06 + (i + 0.5) * cell
                        cy = y + 0.06 + (j + 0.5) * cell
                        s = cell * 0.32
                        b.quad(((cx - s, cy - s, 0.0006), (cx + s, cy - s, 0.0006), (cx + s, cy + s, 0.0006), (cx - s, cy + s, 0.0006)),
                               "floor_vent", toward=(cx, cy, 1.0))
    return b.finish(collection)


def build_room(collection):
    b = Builder("Room", ["room_dark", "room_panel", "tray_metal", "cable_dark", "cable_teal", "cable_amber", "rack_accent", "rack_body"])
    glow = Builder("RoomGlow", ["light_strip", "footlight", "door_light"])
    rng = random.Random(11)
    xs = frange(-ROOM_HALF_X, ROOM_HALF_X, TILE)
    ys = frange(ROOM_Y0, ROOM_Y1, TILE)
    for x in xs:  # ceiling tiles (only the underside is ever seen)
        for y in ys:
            b.box((x + 0.004, y + 0.004, CEILING_Z), (x + TILE - 0.004, y + TILE - 0.004, CEILING_Z + 0.02), "room_dark", ("-z",))
    for x in xs + [ROOM_HALF_X]:  # ceiling grid
        b.box((x - 0.012, ROOM_Y0, CEILING_Z - 0.012), (x + 0.012, ROOM_Y1, CEILING_Z + 0.001), "room_panel", ("-z", "-x", "+x"))
    for y in ys:  # side walls, in panels so the vertex bake has something to sample
        for z0, z1 in ((0.0, 1.5), (1.5, CEILING_Z)):
            b.box((-ROOM_HALF_X - 0.05, y, z0), (-ROOM_HALF_X, y + TILE, z1), "room_dark", ("+x",))
            b.box((ROOM_HALF_X, y, z0), (ROOM_HALF_X + 0.05, y + TILE, z1), "room_dark", ("-x",))
    # end wall, with an opening for the sliding doors
    wall_y = ROOM_Y1 - 0.2
    for x in xs:
        for z0, z1 in ((0.0, 0.75), (0.75, 1.5), (1.5, 2.25), (2.25, CEILING_Z)):
            if x >= -DOOR_HALF - 0.05 and x + TILE <= DOOR_HALF + 0.05 and z1 <= DOOR_H + 0.05:
                continue
            b.box((x + 0.003, wall_y, z0 + 0.003), (x + TILE - 0.003, ROOM_Y1, z1 - 0.003), "room_panel", ("-y", "-x", "+x", "+z", "-z"))
    b.box((-DOOR_HALF - 0.07, wall_y - 0.03, DOOR_H), (DOOR_HALF + 0.07, wall_y + 0.02, DOOR_H + 0.09), "rack_accent", FRONT5)
    for side in (-1, 1):
        b.box((side * (DOOR_HALF + 0.035) - 0.035, wall_y - 0.03, 0.0), (side * (DOOR_HALF + 0.035) + 0.035, wall_y + 0.02, DOOR_H), "rack_accent", FRONT5)
        # jambs, seen once the doors have opened
        b.quad(((side * DOOR_HALF, wall_y, 0.0), (side * DOOR_HALF, ROOM_Y1, 0.0), (side * DOOR_HALF, ROOM_Y1, DOOR_H), (side * DOOR_HALF, wall_y, DOOR_H)),
               "rack_body", toward=(0.0, ROOM_Y1 - 0.1, 1.2))
    b.quad(((-DOOR_HALF, wall_y, DOOR_H), (DOOR_HALF, wall_y, DOOR_H), (DOOR_HALF, ROOM_Y1, DOOR_H), (-DOOR_HALF, ROOM_Y1, DOOR_H)),
           "rack_body", toward=(0.0, ROOM_Y1 - 0.1, 1.2))
    glow.box((-0.5, wall_y - 0.012, DOOR_H + 0.16), (0.5, wall_y, DOOR_H + 0.19), "door_light", ("-y",))  # sign bar over the door

    doors = []
    for side, name in ((-1, "DoorL"), (1, "DoorR")):  # each leaf slides sideways into the wall
        door = Builder(name, ["rack_body", "rack_accent", "door_light"])
        x0, x1 = sorted((side * DOOR_HALF, side * 0.006))
        door.box((x0, wall_y + 0.06, 0.0), (x1, wall_y + 0.12, DOOR_H), "rack_body", ("-y",))
        sx = side * 0.42
        door.box((sx - 0.05, wall_y + 0.045, 0.75), (sx + 0.05, wall_y + 0.06, 1.95), "door_light", ("-y",))
        door.box((side * 0.10 - 0.012, wall_y + 0.02, 0.95), (side * 0.10 + 0.012, wall_y + 0.06, 1.25), "rack_accent", FRONT5)
        doors.append(door.finish(collection))

    for side in (-1, 1):  # ceiling light strips over the aisle
        x = side * 0.62
        for y in frange(ROOM_Y0 + 0.6, ROOM_Y1 - 1.4, 1.8):
            b.box((x - 0.07, y, CEILING_Z - 0.05), (x + 0.07, y + 1.25, CEILING_Z - 0.004), "rack_body", ("-x", "+x", "-y", "+y"))
            glow.box((x - 0.045, y + 0.03, CEILING_Z - 0.056), (x + 0.045, y + 1.22, CEILING_Z - 0.05), "light_strip", ("-z",))
    row_y0 = ROW_START_Y - PITCH / 2
    for side in (-1, 1):  # footlights along the base of both rows
        x = side * (AISLE_HALF - 0.012)
        glow.box((x - 0.006, row_y0, 0.012), (x + 0.006, ROW_END_Y, 0.024), "footlight", ("+z", "-x", "+x"))
    top = RACK_H
    for side in (-1, 1):  # containment: rails along the cabinet tops and beams across the aisle
        x = side * (AISLE_HALF + 0.02)
        b.box((x - 0.025, row_y0, top), (x + 0.025, ROW_END_Y, top + 0.06), "rack_accent")
    for i in range(0, RACKS_PER_SIDE + 1, 4):
        y = row_y0 + i * PITCH
        b.box((-AISLE_HALF, y - 0.025, top + 0.005), (AISLE_HALF, y + 0.025, top + 0.065), "rack_accent")
    tray_z = 2.52
    for side in (-1, 1):  # cable trays above each row, with hangers, rungs, cables and drops
        cx = side * (AISLE_HALF + 0.50)
        for rail in (-0.24, 0.24):
            b.box((cx + rail - 0.01, ROOM_Y0, tray_z), (cx + rail + 0.01, ROOM_Y1 - 0.2, tray_z + 0.07), "tray_metal")
        for y in frange(ROOM_Y0 + 0.15, ROOM_Y1 - 0.3, 0.3):
            b.box((cx - 0.23, y - 0.012, tray_z + 0.004), (cx + 0.23, y + 0.012, tray_z + 0.018), "tray_metal")
        for y in frange(ROOM_Y0 + 0.6, ROOM_Y1 - 0.4, 1.8):
            for rail in (-0.24, 0.24):
                b.box((cx + rail - 0.006, y - 0.006, tray_z + 0.07), (cx + rail + 0.006, y + 0.006, CEILING_Z), "tray_metal", ("-x", "+x", "-y", "+y"))
        for k in range(7):
            material = ("cable_dark", "cable_dark", "cable_teal", "cable_dark", "cable_amber", "cable_dark", "cable_teal")[k]
            radius = 0.011 + 0.006 * rng.random()
            b.prism_y(cx - 0.18 + k * 0.06, tray_z + 0.02 + radius, radius, ROOM_Y0, ROOM_Y1 - 0.2, material)
        for i in range(RACKS_PER_SIDE):
            if rng.random() < 0.55:
                y = ROW_START_Y + i * PITCH + rng.uniform(-0.15, 0.15)
                dx = cx - side * rng.uniform(0.05, 0.2)
                material = rng.choice(("cable_dark", "cable_teal", "cable_amber"))
                b.box((dx - 0.008, y - 0.008, RACK_H), (dx + 0.008, y + 0.008, tray_z + 0.02), material, ("-x", "+x", "-y", "+y"))
    return b.finish(collection), glow.finish(collection), doors


def slot_transforms():
    """(name, location, rotation_z, variant) for every cabinet position in the aisle."""
    rng = random.Random(3)
    slots = []
    for side, label in ((-1, "L"), (1, "R")):
        for i in range(RACKS_PER_SIDE):
            variant = rng.choice("AABC")
            y = ROW_START_Y + i * PITCH
            rotation = math.radians(90) if side < 0 else math.radians(-90)  # front faces the aisle centre
            slots.append((f"Slot.{label}.{i:02d}.{variant}", (side * AISLE_HALF, y, 0.0), rotation, variant))
    return slots


# -------------------------------------------------------------------- tunnel
def tunnel_profile():
    """Cross-section corners (x, z), clockwise from the right floor edge, for the right half."""
    return [(TUNNEL["floorHalf"], 0.0), (TUNNEL["halfWidth"], TUNNEL["shoulder"]),
            (TUNNEL["halfWidth"], TUNNEL["haunch"]), (TUNNEL["ceilHalf"], TUNNEL["height"])]


def build_tunnel(collection):
    b = Builder("Tunnel", ["tunnel_wall", "tunnel_floor", "tray_metal", "cable_dark", "cable_teal", "cable_amber", "rack_accent"])
    glow = Builder("TunnelGlow", ["tunnel_ring", "footlight"], layers=True)
    profile = tunnel_profile()
    bays = round(TUNNEL["length"] / TUNNEL["bay"])
    height = TUNNEL["height"]
    for bay in range(bays):
        y0 = TUNNEL_Y0 + bay * TUNNEL["bay"]
        y1 = y0 + TUNNEL["bay"]
        axis = (0.0, (y0 + y1) / 2, height / 2)
        fh, ch = TUNNEL["floorHalf"], TUNNEL["ceilHalf"]
        b.quad(((-fh, y0, 0.0), (fh, y0, 0.0), (fh, y1, 0.0), (-fh, y1, 0.0)), "tunnel_floor", toward=axis)
        b.quad(((-ch, y0, height), (ch, y0, height), (ch, y1, height), (-ch, y1, height)), "tunnel_wall", toward=axis)
        for side in (-1, 1):
            for (xa, za), (xb, zb) in zip(profile, profile[1:]):
                b.quad(((side * xa, y0, za), (side * xb, y0, zb), (side * xb, y1, zb), (side * xa, y1, za)), "tunnel_wall", toward=axis)
    # ribs with a ring of light on each
    outline = [(x, z) for x, z in profile] + [(-x, z) for x, z in reversed(profile)]  # right floor -> right ceiling -> left ceiling -> left floor
    for rib in range(bays + 1):
        y = TUNNEL_Y0 + rib * TUNNEL["bay"]
        centre = Vector((0.0, y, height / 2))
        for (xa, za), (xb, zb) in zip(outline, outline[1:]):
            a, c = Vector((xa, y, za)), Vector((xb, y, zb))
            inward = (centre - (a + c) / 2)
            inward.y = 0
            inward.normalize()
            b.beam(a + inward * 0.05, c + inward * 0.05, 0.14, "rack_accent", height=0.1)
            # the light: a thin strip on the rib's inner face
            p, q = a + inward * 0.104, c + inward * 0.104
            glow.quad(((p.x, y - 0.03, p.z), (q.x, y - 0.03, q.z), (q.x, y + 0.03, q.z), (p.x, y + 0.03, p.z)), "tunnel_ring",
                      toward=centre, color=(rib / bays, 0.0, 0.0))
    for side in (-1, 1):
        x = side * (TUNNEL["halfWidth"] - 0.07)
        b.prism_y(x, 1.02, 0.05, TUNNEL_Y0, TUNNEL_Y1, "cable_dark")
        b.prism_y(x, 1.2, 0.035, TUNNEL_Y0, TUNNEL_Y1, "cable_teal")
        b.prism_y(x, 1.33, 0.03, TUNNEL_Y0, TUNNEL_Y1, "cable_amber")
        b.prism_y(side * 0.55, height - 0.07, 0.045, TUNNEL_Y0, TUNNEL_Y1, "tray_metal")
        # wash light along the foot of each wall
        fx = side * (TUNNEL["floorHalf"] + 0.04)
        glow.quad(((fx - 0.012, TUNNEL_Y0, 0.05), (fx + 0.012, TUNNEL_Y0, 0.05), (fx + 0.012, TUNNEL_Y1, 0.05), (fx - 0.012, TUNNEL_Y1, 0.05)),
                  "footlight", toward=(0.0, (TUNNEL_Y0 + TUNNEL_Y1) / 2, 2.0), color=(0.0, 0.0, 0.0))
    # portal where the tunnel meets the core
    for side in (-1, 1):
        x0, x1 = sorted((side * TUNNEL["halfWidth"], side * 2.75))
        b.box((x0, TUNNEL_Y1 - 0.12, 0.0), (x1, TUNNEL_Y1 + 0.5, TIER_H - 0.12), "rack_accent")
    b.box((-2.75, TUNNEL_Y1 - 0.12, height), (2.75, TUNNEL_Y1 + 0.5, TIER_H - 0.12), "rack_accent")
    return b.finish(collection), glow.finish(collection)


# ---------------------------------------------------------------------- core
def platform_sectors():
    return {(p["tier"], p["sector"]) for p in CORE["platforms"]}


def sector_is_open(tier, sector):
    """No railing where the tunnel bridge or an exhibit platform joins the deck."""
    return (tier == 0 and sector == 0) or (tier, sector) in platform_sectors()


def sector_has_racks(tier, sector):
    return not (tier == 0 and sector == 0)


def build_core_shell(collection):
    b = Builder("CoreShell", ["core_wall", "room_dark"])
    segs = 64
    step = TAU / segs
    for tier in range(TIER_MIN, TIER_MAX + 1):
        z0, z1 = tier * TIER_H, (tier + 1) * TIER_H
        for i in range(segs):
            if tier == 0 and (i <= 2 or i >= segs - 2):  # the tunnel mouth
                continue
            a0, a1 = (i - 0.5) * step, (i + 0.5) * step
            b.quad((pol(CORE_R, a0, z0), pol(CORE_R, a1, z0), pol(CORE_R, a1, z1), pol(CORE_R, a0, z1)), "core_wall",
                   toward=(0.0, 0.0, (z0 + z1) / 2))
    b.ring(OCULUS_R, CORE_R, ROOF_UNDER, "room_dark", segs=32, up=False, bands=2)
    b.tube(OCULUS_R, ROOF_UNDER, ROOF_TOP + 0.5, "room_dark", segs=32, inward=True)
    return b.finish(collection, CORE_CENTRE)


def build_core_modules(collection):
    """One 22.5 degree sector of one tier, modelled at sector 0 / tier 0 and instanced in Three.js."""
    half = SECTOR_ANGLE / 2
    deck = Builder("CoreDeckSector", ["core_deck", "core_wall", "rack_body"])
    deck.arc_box(CORE["deckInner"], CORE_R, -half, half, -0.12, 0.0, "core_deck", segs=4, faces=("top", "bottom", "inner"))
    deck.arc_box(9.3, CORE_R, half - 0.016, half + 0.016, 0.0, TIER_H - 0.12, "core_wall", segs=1, faces=("inner", "start", "end"))
    deck.arc_box(8.72, 9.08, -half + 0.02, half - 0.02, -0.17, -0.12, "rack_body", segs=4, faces=("inner", "outer", "start", "end"))

    rail = Builder("CoreRailSector", ["core_rail"])
    r = CORE["deckInner"] + 0.05
    for z in (0.55, 1.03):
        rail.arc_box(r - 0.02, r + 0.02, -half, half, z - 0.02, z + 0.02, "core_rail", segs=4, faces=("top", "bottom", "inner", "outer"))
    for i in range(4):
        a = -half + SECTOR_ANGLE * (i + 0.5) / 4
        rail.beam(pol(r, a, 0.0), pol(r, a, 1.03), 0.04, "core_rail", ends=False)

    glow = Builder("CoreGlowSector", ["core_ring", "core_edge"])
    glow.ring(8.76, 9.04, -0.172, "core_ring", segs=4, up=False, a0=-half + 0.03, a1=half - 0.03)
    glow.tube(CORE["deckInner"] - 0.002, -0.10, -0.02, "core_edge", segs=4, a0=-half, a1=half, inward=True)

    # five low-detail cabinets; their surface colour is folded into the bake
    racks = Builder("CoreRackSector", ["core_rack"])
    racks.enable_albedo()
    leds = Builder("CoreLedSector", ["led"], layers=True)
    rng = random.Random(909)
    count = CORE["racksPerSector"]
    hw = RACK_W / 2
    for j in range(count):
        frame = station(0.0, CORE["rackFront"]) @ Matrix.Translation(((j - (count - 1) / 2) * PITCH, 0.0, 0.0))
        with racks.at(frame), leds.at(frame):
            # shell: front frame, sides and top
            for (lo, hi, colour, faces) in (
                ((-hw, 0.0, 0.0), (-hw + 0.03, RACK_D, RACK_H), "rack_body", ("-x", "+x", "-y", "+z")),
                ((hw - 0.03, 0.0, 0.0), (hw, RACK_D, RACK_H), "rack_body", ("-x", "+x", "-y", "+z")),
                ((-hw + 0.03, 0.0, RACK_H - 0.09), (hw - 0.03, RACK_D, RACK_H), "rack_bezel", ("-y", "+z", "-z")),
                ((-hw + 0.03, 0.0, 0.0), (hw - 0.03, 0.05, 0.1), "rack_vent", ("-y", "+z")),
            ):
                box_with_albedo(racks, lo, hi, colour, faces)
            quad_with_albedo(racks, -hw + 0.03, hw - 0.03, 0.1, RACK_H - 0.09, 0.05, "rack_vent")
            z = 0.13
            while z < RACK_H - 0.2:
                units = rng.choice((1, 1, 2, 2, 3, 4))
                h = units * 0.075
                if z + h > RACK_H - 0.12:
                    break
                colour = rng.choice(("rack_bezel", "rack_bezel", "rack_body", "rack_accent" if units == 1 else "rack_bezel"))
                box_with_albedo(racks, (-hw + 0.045, 0.02, z), (hw - 0.045, 0.05, z + h - 0.012), colour, ("-y", "+z", "-z"))
                for _ in range(rng.choice((1, 2, 2, 3))):
                    leds.led(rng.uniform(-hw + 0.08, hw - 0.08), z + (h - 0.012) * rng.uniform(0.3, 0.7),
                             rng.choice((LED_GREEN, LED_GREEN, LED_CYAN, LED_CYAN, LED_AMBER)),
                             rng.choice((0.0, 0.5, 1.0, 1.0)), rng, 0.02, 0.011, y=0.018)
                z += h
            leds.led(0.0, RACK_H - 0.045, LED_WHITE, 0.0, rng, 0.34, 0.012, y=-0.002)
    origin = CORE_CENTRE
    return (deck.finish(collection, origin), rail.finish(collection, origin), glow.finish(collection, origin),
            racks.finish(collection, origin), leds.finish(collection, origin))


def box_with_albedo(builder, lo, hi, colour, faces):
    """Add a box to a single-material builder, tagging it with the colour of another material."""
    before = len(builder.bm.faces)
    builder.box(lo, hi, "core_rack", faces)
    tag_albedo(builder, before, colour)


def quad_with_albedo(builder, x0, x1, z0, z1, y, colour):
    before = len(builder.bm.faces)
    builder.front_quad(x0, x1, z0, z1, y, "core_rack")
    tag_albedo(builder, before, colour)


def tag_albedo(builder, first_face, colour):
    builder.bm.faces.ensure_lookup_table()
    base = MATERIALS[colour][0]
    for face in builder.bm.faces[first_face:]:
        for loop in face.loops:
            loop[builder.albedo_layer] = (*base, 1.0)


def railing(b, p0, p1, posts=4, height=1.03):
    """A straight two-rail railing between two floor points."""
    p0, p1 = Vector(p0), Vector(p1)
    for z in (0.55, height):
        b.beam(p0 + Vector((0, 0, z)), p1 + Vector((0, 0, z)), 0.04, "core_rail")
    for i in range(posts + 1):
        p = p0.lerp(p1, i / posts)
        b.beam(p, p + Vector((0, 0, height)), 0.04, "core_rail", ends=False)


def build_core_spine(collection):
    b = Builder("CoreSpine", ["spine_body", "core_deck", "core_rail", "rack_accent"])
    glow = Builder("CoreSpineGlow", ["spine_flow", "core_edge", "pit_pool", "core_ring"], layers=True)
    sr = CORE["spineRadius"]
    top = ROOF_UNDER - 1.25
    tiers = TIER_MAX - TIER_MIN + 1
    b.tube(sr, PIT_Z, top, "spine_body", segs=24, zsegs=tiers)
    for tier in range(TIER_MIN + 1, TIER_MAX + 1):  # collars
        z = tier * TIER_H
        b.tube(sr + 0.14, z - 0.16, z + 0.1, "rack_accent", segs=24)
        b.ring(sr, sr + 0.14, z + 0.1, "rack_accent", segs=24, up=True)
        b.ring(sr, sr + 0.14, z - 0.16, "rack_accent", segs=24, up=False)
    span = top - PIT_Z
    for i in range(8):  # light conduits running the full height
        a = TAU * (i + 0.5) / 8
        half = 0.055
        for k in range(tiers):
            z0 = PIT_Z + span * k / tiers
            z1 = PIT_Z + span * (k + 1) / tiers
            glow.quad((pol(sr + 0.012, a - half, z0), pol(sr + 0.012, a + half, z0), pol(sr + 0.012, a + half, z1), pol(sr + 0.012, a - half, z1)),
                      "spine_flow", away=(0.0, 0.0, (z0 + z1) / 2), color=(i / 8, 0.0, 0.0),
                      uvs=[(0.0, (z0 - PIT_Z) / span), (1.0, (z0 - PIT_Z) / span), (1.0, (z1 - PIT_Z) / span), (0.0, (z1 - PIT_Z) / span)])
    # emitter at the top: a tapering crown with prongs
    b.arc_box(0.55, sr + 0.2, 0.0, TAU, top, top + 0.22, "rack_accent", segs=24, faces=("top", "bottom", "outer", "inner"))
    for i in range(6):
        a = TAU * i / 6
        b.beam(pol(sr - 0.1, a, top + 0.2), pol(0.62, a, top + 1.15), 0.12, "rack_accent")
    glow.ring(0.0, 0.5, top + 0.24, "spine_flow", segs=16, up=True, color=(0.5, 0.0, 0.0), uvs=True)

    # landing around the spine at the tunnel level, and the bridge to it
    lr = CORE["landingRadius"]
    b.arc_box(sr, lr, 0.0, TAU, -0.14, 0.0, "core_deck", segs=24, faces=("top", "bottom", "outer"))
    gap = math.radians(26)  # the bridge arrives at angle 0
    rail_r = lr - 0.05
    for z in (0.55, 1.03):
        b.arc_box(rail_r - 0.02, rail_r + 0.02, gap, TAU - gap, z - 0.02, z + 0.02, "core_rail", segs=20, faces=("top", "bottom", "inner", "outer", "start", "end"))
    for i in range(13):
        a = gap + (TAU - 2 * gap) * i / 12
        b.beam(pol(rail_r, a, 0.0), pol(rail_r, a, 1.03), 0.04, "core_rail", ends=False)
    glow.tube(lr + 0.002, -0.11, -0.03, "core_edge", segs=24, color=(0.0, 0.0, 0.0))
    bridge_half = 1.1
    y_out, y_in = -CORE["deckInner"] - 0.02, -lr + 0.12
    b.box((-bridge_half, y_out, -0.14), (bridge_half, y_in, 0.0), "core_deck", ("+z", "-z", "-x", "+x"))
    for side in (-1, 1):
        railing(b, (side * (bridge_half - 0.05), y_out + 0.1, 0.0), (side * (bridge_half - 0.05), y_in - 0.5, 0.0), posts=6)
        b.beam((side * 0.7, y_out, -0.2), (side * 0.7, y_in, -0.2), 0.1, "rack_accent", height=0.16)
        x = side * bridge_half
        glow.quad(((x, y_out, -0.11), (x, y_in, -0.11), (x, y_in, -0.03), (x, y_out, -0.03)), "core_edge",
                  away=(0.0, (y_out + y_in) / 2, -0.07), color=(0.0, 0.0, 0.0))
    # the pool at the bottom, and the big ring of light under the roof
    glow.ring(sr, CORE_R, PIT_Z + 0.02, "pit_pool", segs=32, up=True, bands=3, color=(0.0, 0.0, 0.0), uvs=True)
    glow.ring(8.85, 9.15, ROOF_UNDER - 0.03, "core_ring", segs=48, up=False, color=(0.0, 0.0, 0.0))
    glow.tube(OCULUS_R - 0.01, ROOF_UNDER + 0.08, ROOF_UNDER + 0.16, "core_edge", segs=32, inward=True, color=(0.0, 0.0, 0.0))
    return b.finish(collection, CORE_CENTRE), glow.finish(collection, CORE_CENTRE)


def build_platforms(collection):
    b = Builder("CorePlatforms", ["core_deck", "core_rail", "rack_accent"])
    edge_materials = [f"platform_edge_{i + 1}" for i in range(len(CORE["platforms"]))]
    glow = Builder("CorePlatformGlow", edge_materials)
    half = math.radians(CORE["platformHalfAngleDeg"])
    inner, outer = CORE["platformInner"], CORE["deckInner"]
    for index, platform in enumerate(CORE["platforms"]):
        centre = platform["sector"] * SECTOR_ANGLE
        z = platform["tier"] * TIER_H
        with b.at(Matrix.Translation((0, 0, z))), glow.at(Matrix.Translation((0, 0, z))):
            b.arc_box(inner, outer + 0.02, centre - half, centre + half, -0.14, 0.0, "core_deck", segs=6)
            for side in (-1, 1):
                a = centre + side * (half - 0.012)
                railing(b, pol(inner + 0.15, a), pol(outer - 0.05, a), posts=5)
                strut = centre + side * math.radians(11)
                b.beam(pol(inner + 0.8, strut, -0.14), pol(CORE_R - 0.05, strut, -2.3), 0.12, "rack_accent")
                edge = centre + side * half
                glow.quad((pol(inner, edge, -0.12), pol(outer, edge, -0.12), pol(outer, edge, -0.02), pol(inner, edge, -0.02)),
                          edge_materials[index], away=pol((inner + outer) / 2, centre, -0.07))
            glow.tube(inner - 0.002, -0.12, -0.02, edge_materials[index], segs=6, a0=centre - half, a1=centre + half, inward=True)
            # a line of light set into the deck, around where the exhibit stands
            glow.ring(inner + 0.35, inner + 0.41, 0.004, edge_materials[index], segs=6, up=True, a0=centre - half + 0.06, a1=centre + half - 0.06)
    return b.finish(collection, CORE_CENTRE), glow.finish(collection, CORE_CENTRE)


def exhibit_frame(platform):
    return station(platform["sector"] * SECTOR_ANGLE, CORE["exhibitRadius"], platform["tier"] * TIER_H)


def build_exhibits(collection):
    """Four set pieces, one per case study. Local frame: +X right, +Y away from the viewer, Z up."""
    b = Builder("Exhibits", ["rack_body", "rack_bezel", "rack_vent", "rack_accent", "core_deck", "core_rail", "tray_metal"])
    glow = Builder("ExhibitGlow", ["screen", "gate", "cloud_block", "mast_light", "led"] + [f"platform_edge_{i + 1}" for i in range(4)], layers=True)
    markers = []
    rng = random.Random(77)
    observability, networking, knowledge, migration = CORE["platforms"]

    # 1. observability: an arc of tall dashboards over a console
    frame = exhibit_frame(observability)
    with b.at(frame), glow.at(frame):
        for i in range(-2, 3):
            place = Matrix.Translation((i * 1.06, 0.95 - 0.11 * i * i, 0.0)) @ Matrix.Rotation(math.radians(-13 * i), 4, "Z")
            with b.at(place), glow.at(place):
                b.box((-0.5, -0.03, 0.5), (0.5, 0.03, 2.25), "rack_body")
                b.box((-0.05, 0.03, 0.0), (0.05, 0.11, 0.9), "rack_accent")
                b.box((-0.3, -0.12, 0.0), (0.3, 0.2, 0.04), "rack_accent")
                glow.front_quad(-0.455, 0.455, 0.56, 2.19, -0.0315, "screen", color=((i + 2) / 4, 0.0, 0.0),
                                uvs=[(0, 0), (1, 0), (1, 1), (0, 1)])
        b.box((-1.55, -1.05, 0.0), (1.55, -0.62, 0.74), "rack_body")
        b.box((-1.55, -1.12, 0.74), (1.55, -0.55, 0.79), "rack_bezel")
        for k in range(14):
            x = -1.38 + k * 0.21
            glow.quad(((x, -1.0, 0.792), (x + 0.13, -1.0, 0.792), (x + 0.13, -0.92, 0.792), (x, -0.92, 0.792)), "led",
                      toward=(x, -0.96, 2.0), color=LED_CYAN if k % 3 else LED_GREEN, uvs=[(1.0 if k % 2 else 0.5, rng.random())] * 4)

    # 2. networking: a lattice mast with panel antennas and a dish, fed from a cabinet
    frame = exhibit_frame(networking)
    with b.at(frame), glow.at(frame):
        centre, height, legs = Vector((0.35, 0.55, 0.0)), 5.0, []
        for i in range(3):
            a = TAU * i / 3 + 0.5
            foot = centre + Vector((0.46 * math.cos(a), 0.46 * math.sin(a), 0.0))
            head = centre + Vector((0.2 * math.cos(a), 0.2 * math.sin(a), height))
            legs.append((foot, head))
            b.beam(foot, head, 0.06, "tray_metal")
        levels = 8
        for k in range(levels + 1):
            ring = [foot.lerp(head, k / levels) for foot, head in legs]
            for i in range(3):
                b.beam(ring[i], ring[(i + 1) % 3], 0.035, "tray_metal")
                if k < levels:
                    upper = legs[(i + 1) % 3][0].lerp(legs[(i + 1) % 3][1], (k + 1) / levels)
                    b.beam(ring[i], upper, 0.028, "tray_metal")
        for i in range(3):  # panel antennas
            a = TAU * i / 3 - math.pi / 2
            out = Vector((math.cos(a), math.sin(a), 0.0))
            place = Matrix.Translation(centre + out * 0.42 + Vector((0, 0, 4.25))) @ Matrix.Rotation(a - math.pi / 2, 4, "Z")
            with b.at(place):
                b.box((-0.14, -0.06, -0.6), (0.14, 0.06, 0.6), "rack_bezel")
            b.beam(centre + out * 0.2 + Vector((0, 0, 4.25)), centre + out * 0.38 + Vector((0, 0, 4.25)), 0.04, "tray_metal")
        dish_dir = Vector((-0.55, -0.8, 0.12))
        b.disc_facing(centre + Vector((-0.3, -0.45, 3.1)), dish_dir, 0.46, 0.07, "rack_accent")
        b.beam(centre + Vector((-0.05, -0.1, 3.1)), centre + Vector((-0.27, -0.4, 3.1)), 0.05, "tray_metal")
        glow.box((centre.x - 0.05, centre.y - 0.05, height + 0.02), (centre.x + 0.05, centre.y + 0.05, height + 0.14), "mast_light")
        b.box((-1.5, 0.25, 0.0), (-0.75, 0.85, 1.2), "rack_body")
        b.box((-1.46, 0.235, 0.12), (-0.79, 0.25, 1.1), "rack_bezel", ("-y", "-x", "+x", "+z", "-z"))
        for k in range(10):
            glow.front_quad(-1.4 + k * 0.058, -1.37 + k * 0.058, 0.96, 0.975, 0.233, "led",
                            color=LED_GREEN if k % 4 else LED_AMBER, uvs=[(1.0, rng.random())] * 4)
        b.beam((-0.75, 0.55, 0.9), (0.0, 0.55, 0.35), 0.035, "tray_metal")
        markers.append(("Marker.Antenna", frame @ (centre + Vector((0, 0, 4.25)))))

    # 3. knowledge: a pedestal for the floating document lattice (built in Three.js)
    frame = exhibit_frame(knowledge)
    with b.at(frame), glow.at(frame):
        b.arc_box(0.0001, 1.05, 0.0, TAU, 0.0, 0.3, "rack_body", segs=20, faces=("top", "outer"))
        b.arc_box(0.0001, 0.7, 0.0, TAU, 0.3, 0.46, "rack_bezel", segs=20, faces=("top", "outer"))
        glow.ring(0.5, 0.57, 0.464, "platform_edge_3", segs=20, up=True)
        glow.tube(1.052, 0.1, 0.16, "platform_edge_3", segs=20)
        markers.append(("Marker.Orb", frame @ Vector((0.0, 0.0, 2.1))))

    # 4. migration: a legacy machine, a rail over a test gate, and a stack of cloud blocks
    frame = exhibit_frame(migration)
    with b.at(frame), glow.at(frame):
        b.box((-2.45, 0.2, 0.0), (-1.4, 1.0, 1.95), "rack_body")
        b.box((-2.4, 0.185, 1.1), (-1.45, 0.2, 1.88), "rack_bezel", ("-y", "-x", "+x", "+z", "-z"))
        for x in (-2.16, -1.69):
            b.disc_facing((x, 0.165, 1.5), (0, -1, 0), 0.2, 0.04, "rack_accent")
            b.disc_facing((x, 0.14, 1.5), (0, -1, 0), 0.06, 0.03, "rack_vent")
        for row in range(3):
            for col in range(9):
                glow.front_quad(-2.34 + col * 0.1, -2.29 + col * 0.1, 0.78 + row * 0.09, 0.81 + row * 0.09, 0.184, "led",
                                color=LED_AMBER if (row + col) % 3 else LED_WHITE, uvs=[(0.5 if col % 2 else 0.0, rng.random())] * 4)
        for k in range(5):
            b.box((-2.36, 0.19, 0.12 + k * 0.11), (-1.49, 0.2, 0.18 + k * 0.11), "rack_vent", ("-y",))
        b.box((1.25, 0.1, 0.0), (2.6, 1.3, 0.07), "core_deck")
        size, gap = 0.36, 0.07
        for ix in range(3):
            for iy in range(2):
                for iz in range(rng.choice((1, 2, 2, 3))):
                    x0 = 1.34 + ix * (size + gap)
                    y0 = 0.22 + iy * (size + gap)
                    z0 = 0.09 + iz * (size + gap)
                    glow.box((x0, y0, z0), (x0 + size, y0 + size, z0 + size), "cloud_block")
        start, end, apex = Vector((-1.9, 0.6, 1.95)), Vector((1.92, 0.76, 1.35)), 2.95
        points = []
        for k in range(13):
            t = k / 12
            p = start.lerp(end, t)
            p.z += (apex - (start.z + end.z) / 2) * 4 * t * (1 - t)
            points.append(p)
        for p, q in zip(points, points[1:]):
            b.beam(p - Vector((0, 0, 0.09)), q - Vector((0, 0, 0.09)), 0.05, "tray_metal")
        for p in (points[2], points[10]):
            b.beam(p - Vector((0, 0, 0.09)), Vector((p.x, p.y, 0.0)), 0.05, "tray_metal")
        gate_centre, gate_dir = points[6], (points[7] - points[5]).normalized()
        side = gate_dir.cross(Vector((0, 0, 1))).normalized()
        upv = side.cross(gate_dir).normalized()
        ring_points = [gate_centre + (side * math.cos(TAU * i / 16) + upv * math.sin(TAU * i / 16)) * 0.46 for i in range(16)]
        for i in range(16):
            glow.beam(ring_points[i], ring_points[(i + 1) % 16], 0.045, "gate")
        markers.append(("Marker.ArcStart", frame @ start))
        markers.append(("Marker.ArcEnd", frame @ end))
        markers.append(("Marker.ArcApex", frame @ points[6]))

    return b.finish(collection, CORE_CENTRE), glow.finish(collection, CORE_CENTRE), markers


# ---------------------------------------------------------------------- roof
def build_roof(collection):
    b = Builder("Roof", ["roof_slab", "roof_unit", "rack_body", "rack_vent", "rack_accent", "tray_metal", "core_rail"])
    glow = Builder("RoofGlow", ["roof_line", "warm_light", "mast_light", "led"], layers=True)
    fan_slots = []
    radius, top = ROOF["radius"], ROOF_TOP
    with b.at(Matrix.Translation((0, 0, top))), glow.at(Matrix.Translation((0, 0, top))):
        b.ring(OCULUS_R + 0.4, radius, 0.0, "roof_slab", segs=48, up=True, bands=4)
        b.arc_box(OCULUS_R, OCULUS_R + 0.4, 0.0, TAU, 0.0, 0.5, "roof_unit", segs=32, faces=("top", "outer"))
        b.arc_box(radius - 0.3, radius, 0.0, TAU, 0.0, ROOF["parapetHeight"], "roof_unit", segs=48, faces=("top", "inner", "outer"))
        glow.tube(radius - 0.302, ROOF["parapetHeight"] - 0.12, ROOF["parapetHeight"] - 0.07, "roof_line", segs=48, inward=True)
        glow.tube(OCULUS_R + 0.402, 0.36, 0.42, "roof_line", segs=32)
        # railing around the oculus
        rail_r = OCULUS_R + 0.2
        for z in (1.0, 1.45):
            b.arc_box(rail_r - 0.02, rail_r + 0.02, 0.0, TAU, z - 0.02, z + 0.02, "core_rail", segs=32, faces=("top", "bottom", "inner", "outer"))
        for i in range(24):
            b.beam(pol(rail_r, TAU * i / 24, 0.5), pol(rail_r, TAU * i / 24, 1.45), 0.04, "core_rail", ends=False)

        penthouse, mast = math.radians(112), math.radians(205)
        for k in range(8):  # cooling units, each with two fans
            angle = math.radians(22.5 + 45 * k)
            if min(abs(angle - penthouse), abs(angle - mast)) < math.radians(24):
                continue
            frame = station(angle, 9.6)
            with b.at(frame), glow.at(frame):
                b.box((-1.3, -0.8, 0.12), (1.3, 0.8, 1.4), "roof_unit")
                for foot in (-1.1, 1.1):
                    b.box((foot - 0.1, -0.7, 0.0), (foot + 0.1, 0.7, 0.12), "rack_body")
                for louvre in range(6):
                    z = 0.3 + louvre * 0.16
                    b.box((-1.2, -0.83, z), (1.2, -0.8, z + 0.07), "rack_body", ("-y", "+z", "-z"))
                glow.front_quad(1.0, 1.16, 1.2, 1.24, -0.802, "roof_line")
                for x in (-0.62, 0.62):
                    with b.at(Matrix.Translation((x, 0.0, 0.0))):
                        b.arc_box(0.5, 0.56, 0.0, TAU, 1.4, 1.6, "rack_accent", segs=16, faces=("top", "inner", "outer"))
                        b.ring(0.0001, 0.5, 1.405, "rack_vent", segs=16, up=True)
                    fan_slots.append(Matrix.Translation((0, 0, top)) @ frame @ Vector((x, 0.0, 1.52)))
            b.beam(pol(OCULUS_R + 0.4, angle, 0.07), pol(8.8, angle, 0.07), 0.3, "tray_metal", height=0.08)

        frame = station(penthouse, 11.0)  # stair hut with a lit doorway
        with b.at(frame), glow.at(frame):
            b.box((-1.6, -1.2, 0.0), (1.6, 1.2, 2.5), "roof_unit")
            b.box((-1.75, -1.5, 2.5), (1.75, 1.3, 2.62), "rack_body")
            b.box((-0.5, -1.215, 0.0), (0.5, -1.2, 2.05), "rack_body", ("-y",))
            glow.front_quad(-0.36, -0.26, 0.5, 1.75, -1.217, "warm_light")
            glow.front_quad(-0.9, 0.9, 2.3, 2.34, -1.202, "warm_light")

        frame = station(mast, 11.6)  # lattice mast with obstruction lights and dishes
        with b.at(frame), glow.at(frame):
            height, legs = 9.0, []
            for i in range(3):
                a = TAU * i / 3 + 0.3
                foot = Vector((0.7 * math.cos(a), 0.7 * math.sin(a), 0.0))
                head = Vector((0.16 * math.cos(a), 0.16 * math.sin(a), height))
                legs.append((foot, head))
                b.beam(foot, head, 0.08, "tray_metal")
            levels = 11
            for k in range(levels + 1):
                ring = [foot.lerp(head, k / levels) for foot, head in legs]
                for i in range(3):
                    b.beam(ring[i], ring[(i + 1) % 3], 0.04, "tray_metal")
                    if k < levels:
                        upper = legs[(i + 1) % 3][0].lerp(legs[(i + 1) % 3][1], (k + 1) / levels)
                        b.beam(ring[i], upper, 0.035, "tray_metal")
            b.disc_facing((0.0, -0.55, 5.6), (0.2, -1.0, 0.1), 0.6, 0.08, "rack_accent")
            b.disc_facing((0.5, 0.2, 7.0), (1.0, 0.3, 0.05), 0.42, 0.07, "rack_accent")
            for z in (4.5, height + 0.05):
                glow.box((-0.06, -0.06, z), (0.06, 0.06, z + 0.14), "mast_light")

        for angle, r in ((math.radians(65), 12.4), (math.radians(160), 12.6), (math.radians(300), 12.3)):  # vent stacks
            with b.at(station(angle, r)):
                b.arc_box(0.26, 0.32, 0.0, TAU, 0.0, 1.9, "roof_unit", segs=12, faces=("top", "inner", "outer"))

    fan = Builder("Fan", ["rack_accent"])
    for i in range(5):
        a = TAU * i / 5
        direction = Vector((math.cos(a), math.sin(a), 0.0))
        fan.beam(direction * 0.07, direction * 0.46 + Vector((0, 0, 0.03)), 0.17, "rack_accent", height=0.015)
    fan.arc_box(0.0001, 0.09, 0.0, TAU, -0.03, 0.05, "rack_accent", segs=10, faces=("top", "outer"))
    return b.finish(collection, CORE_CENTRE), glow.finish(collection, CORE_CENTRE), fan.finish(collection), fan_slots


# -------------------------------------------------------------------- baking
def add_bake_attribute(obj):
    mesh = obj.data
    attribute = mesh.color_attributes.new("Bake", "FLOAT_COLOR", "CORNER")
    mesh.color_attributes.active_color = attribute
    mesh.color_attributes.render_color_index = list(mesh.color_attributes).index(attribute)


def bake(objects, samples):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = False
    scene.cycles.max_bounces = 6
    scene.cycles.diffuse_bounces = 4
    scene.render.bake.target = "VERTEX_COLORS"
    for obj in objects:
        add_bake_attribute(obj)
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, target="VERTEX_COLORS")
        print(f"baked {obj.name}: {len(obj.data.loops)} corners")


def normalise_bake(label, objects):
    """Scale one zone's baked irradiance by a shared factor so it fits 0..1."""
    lum = []
    for obj in objects:
        for item in obj.data.color_attributes["Bake"].data:
            r, g, b, _ = item.color
            lum.append(0.2126 * r + 0.7152 * g + 0.0722 * b)
    lum.sort()
    reference = lum[int(len(lum) * 0.985)]
    scale = 0.92 / max(reference, 1e-6)
    for obj in objects:
        for item in obj.data.color_attributes["Bake"].data:
            r, g, b, _ = item.color
            item.color = (min(1.0, r * scale), min(1.0, g * scale), min(1.0, b * scale), 1.0)
    print(f"bake normalised [{label}]: p98.5 luminance {reference:.4f}, scale {scale:.3f}, median {lum[len(lum) // 2] * scale:.3f}")


def fold_albedo_into_bake(obj):
    """For single-material low-detail meshes: COLOR_0 = surface colour x light."""
    mesh = obj.data
    bake_data = mesh.color_attributes["Bake"].data
    albedo = mesh.color_attributes["Albedo"].data
    for i, item in enumerate(bake_data):
        r, g, b, _ = item.color
        ar, ag, ab, _ = albedo[i].color
        # 9 = lifts the dark paint colours into a usable 0..1 range; undone by the material in Three.js
        item.color = (min(1.0, r * ar * 9.0), min(1.0, g * ag * 9.0), min(1.0, b * ab * 9.0), 1.0)
    mesh.color_attributes.remove(mesh.color_attributes["Albedo"])
    mesh.color_attributes.active_color = mesh.color_attributes["Bake"]
    mesh.color_attributes.render_color_index = list(mesh.color_attributes).index(mesh.color_attributes["Bake"])


PREVIEWS = {
    # name: (camera location, look-at), in Blender coordinates
    "aisle": ((0.28, -0.9, 1.35), (-0.05, 6.0, 1.3)),
    "door": ((0.0, 8.6, 1.5), (0.0, 16.0, 1.4)),
    "tunnel": ((0.1, 15.0, 1.55), (0.0, 27.0, 1.6)),
    "bridge": ((0.3, 29.4, 1.75), (0.0, 38.0, 6.0)),
    "core_down": ((2.4, 33.5, 20.0), (-1.5, 40.5, -10.0)),
    "roof": ((9.5, 29.0, 32.4), (-1.0, 40.0, 34.5)),
}


def render_preview(directory, name, location, look_at, samples):
    scene = bpy.context.scene
    camera_data = bpy.data.cameras.new("PreviewCamera")
    camera_data.lens = 22
    camera_data.clip_end = 400
    camera = bpy.data.objects.new("PreviewCamera", camera_data)
    scene.collection.objects.link(camera)
    camera.location = location
    camera.rotation_euler = (Vector(look_at) - Vector(location)).to_track_quat("-Z", "Y").to_euler()
    scene.camera = camera
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.filepath = os.path.join(directory, f"{name}.png")
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(camera)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    parser.add_argument("--preview-dir")
    parser.add_argument("--previews", default="")
    parser.add_argument("--samples", type=int, default=96)
    args = parser.parse_args(argv)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    addon_utils.enable("cycles", default_set=True)
    addon_utils.enable("io_scene_gltf2", default_set=True)
    scene = bpy.context.scene
    collection = scene.collection

    world = bpy.data.worlds.new("World")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.02, 0.035, 0.045, 1.0)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35
    scene.world = world
    moon_data = bpy.data.lights.new("Moon", "SUN")  # shapes the rooftop; indoors is enclosed
    moon_data.energy = 0.22
    moon_data.color = (0.62, 0.74, 1.0)
    moon = bpy.data.objects.new("Moon", moon_data)
    moon.rotation_euler = (math.radians(52), math.radians(8), math.radians(-38))
    collection.objects.link(moon)

    make_materials()
    floor = build_floor(collection)
    room, room_glow, doors = build_room(collection)
    racks, led_meshes = {}, {}
    for variant, seed in (("A", 101), ("B", 202), ("C", 303)):
        racks[variant], led_meshes[variant] = build_rack(variant, seed, collection)
    tunnel, tunnel_glow = build_tunnel(collection)
    shell = build_core_shell(collection)
    deck, rail, sector_glow, core_racks, core_leds = build_core_modules(collection)
    spine, spine_glow = build_core_spine(collection)
    platforms, platform_glow = build_platforms(collection)
    exhibits, exhibit_glow, markers = build_exhibits(collection)
    roof, roof_glow, fan, fan_slots = build_roof(collection)

    stand_ins = []

    def stand_in(source, location, rotation_z):
        copy = bpy.data.objects.new(f"standin.{source.name}.{len(stand_ins)}", source.data)
        copy.location, copy.rotation_euler = location, (0.0, 0.0, rotation_z)
        collection.objects.link(copy)
        stand_ins.append(copy)

    # Aisle: stand a cabinet in every slot so the bake sees the real surroundings.
    slots = slot_transforms()
    home = {}
    for name, location, rotation, variant in slots:
        if variant not in home and name.split(".")[1] == "R" and 5 <= int(name.split(".")[2]) <= 11:
            home[variant] = (location, rotation)
            continue
        for source in (racks[variant], led_meshes[variant]):
            stand_in(source, location, rotation)
    assert set(home) == {"A", "B", "C"}, home
    for variant, (location, rotation) in home.items():
        for source in (racks[variant], led_meshes[variant]):
            source.location, source.rotation_euler = location, (0.0, 0.0, rotation)

    # Core: the sector modules are baked in a typical position (tier 3, sector 6).
    bake_tier, bake_sector = 3, 6
    for tier in range(TIER_MIN + 1, TIER_MAX + 1):
        for sector in range(SECTORS):
            location = CORE_CENTRE + Vector((0, 0, tier * TIER_H))
            rotation = sector * SECTOR_ANGLE
            is_home = tier == bake_tier and sector == bake_sector
            for source in (deck, sector_glow):
                if not is_home:
                    stand_in(source, location, rotation)
            if not sector_is_open(tier, sector) and not is_home:
                stand_in(rail, location, rotation)
            if sector_has_racks(tier, sector) and not is_home:
                stand_in(core_racks, location, rotation)
    for source in (deck, rail, sector_glow, core_racks, core_leds):
        source.location = CORE_CENTRE + Vector((0, 0, bake_tier * TIER_H))
        source.rotation_euler = (0.0, 0.0, bake_sector * SECTOR_ANGLE)
    for position in fan_slots[1:]:
        stand_in(fan, CORE_CENTRE + position, 0.0)
    fan.location = CORE_CENTRE + fan_slots[0]
    bpy.context.view_layer.update()

    zones = {
        "aisle": [floor, room, *doors, *racks.values()],
        "tunnel": [tunnel],
        "core": [shell, deck, rail, core_racks, spine, platforms, exhibits],
        "roof": [roof, fan],
    }
    for label, objects in zones.items():
        moon.hide_render = label != "roof"  # moonlight must not leak into the open end of the aisle
        bake(objects, args.samples)
        normalise_bake(label, objects)
    fold_albedo_into_bake(core_racks)
    apply_final_materials()

    moon.hide_render = False
    if args.preview_dir:
        os.makedirs(args.preview_dir, exist_ok=True)
        wanted = [name for name in args.previews.split(",") if name] or list(PREVIEWS)
        for name in wanted:
            render_preview(args.preview_dir, name, *PREVIEWS[name], max(48, min(args.samples, 96)))

    for copy in stand_ins:
        bpy.data.objects.remove(copy)
    for source in (*racks.values(), *led_meshes.values(), fan):
        source.location, source.rotation_euler = (0.0, 0.0, 0.0), (0.0, 0.0, 0.0)
    for source in (deck, rail, sector_glow, core_racks, core_leds):
        source.location, source.rotation_euler = CORE_CENTRE, (0.0, 0.0, 0.0)
    for name, location, rotation, _variant in slots:
        empty = bpy.data.objects.new(name, None)
        empty.location, empty.rotation_euler = location, (0.0, 0.0, rotation)
        collection.objects.link(empty)
    for index, position in enumerate(fan_slots):
        empty = bpy.data.objects.new(f"FanSlot.{index:02d}", None)
        empty.location = CORE_CENTRE + position
        collection.objects.link(empty)
    for name, position in markers:
        empty = bpy.data.objects.new(name, None)
        empty.location = CORE_CENTRE + position
        collection.objects.link(empty)
    bpy.data.objects.remove(moon)
    bpy.context.view_layer.update()

    stats = {o.name: sum(len(p.vertices) - 2 for p in o.data.polygons) for o in scene.objects if o.type == "MESH"}
    print("triangles:", stats, "total", sum(stats.values()))

    bpy.ops.export_scene.gltf(
        filepath=args.out,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
        export_vertex_color="ACTIVE",
        export_active_vertex_color_when_no_material=True,
        export_all_vertex_colors=False,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_extras=False,
    )
    print("exported", args.out)


if __name__ == "__main__":
    main()
