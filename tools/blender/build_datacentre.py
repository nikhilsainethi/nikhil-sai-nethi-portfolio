"""Build the hero data-centre aisle and export it as glTF.

Run headless (see `npm run model`):

    blender -b --factory-startup --python tools/blender/build_datacentre.py -- \
        --out public/models/datacentre.raw.glb [--preview preview.png] [--samples 96]

Everything is generated from code, so the model is reproducible and reviewable.
The scene is an original, synthetic environment: it is not modelled on any real
facility.

What is exported
  Floor            raised floor tiles (kept separate: it is drawn translucent so
                   mirrored emissives underneath read as reflections)
  Room             ceiling, walls, door, cable trays, containment beams
  RoomGlow         emissive fixtures: ceiling strips, footlights, door slits
  Rack.A/B/C       three cabinet variants, authored once and instanced in Three.js
  RackLeds.A/B/C   LED quads per variant. COLOR_0 = LED colour,
                   UV.x = blink mode (0 steady, .5 breathing, 1 activity flicker),
                   UV.y = random phase
  Slot.<side>.<n>.<variant>   empties marking where each cabinet instance goes

Lighting is baked by Cycles into per-corner vertex colours (COLOR_0) as plain
irradiance, so the page needs no lightmap textures and no real-time shadows.

Blender axes: X across the aisle, Y down the aisle, Z up. glTF export is Y-up.
"""

import argparse
import math
import random
import sys

import addon_utils
import bmesh
import bpy
from mathutils import Vector

# ---------------------------------------------------------------- parameters
RACK_W, RACK_D, RACK_H = 0.60, 1.00, 2.20
PITCH = 0.62            # centre-to-centre spacing of cabinets along the aisle
RACKS_PER_SIDE = 16
ROW_START_Y = -1.60     # centre of the first cabinet; the camera starts near y = -0.9
AISLE_HALF = 1.15       # cabinet fronts sit at x = +/- AISLE_HALF
ROOM_HALF_X = 3.0
ROOM_Y0, ROOM_Y1 = -3.0, 10.2
CEILING_Z = 3.0
TILE = 0.6
U = 0.04445             # one rack unit
UNITS_Z0 = 0.13
BEZEL_HALF = 0.2225
FRONT_Y = 0.03          # bezel front plane, in cabinet-local space (front faces -Y)

ROW_END_Y = ROW_START_Y + (RACKS_PER_SIDE - 1) * PITCH + PITCH / 2

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
    "light_strip": ((0.9, 0.9, 0.9), 0.0, 0.5, (0.72, 0.93, 1.00), 14.0),
    "footlight":   ((0.5, 0.9, 0.8), 0.0, 0.5, (0.45, 1.00, 0.84), 2.2),
    "door_light":  ((0.9, 1.0, 0.9), 0.0, 0.5, (0.78, 1.00, 0.86), 9.0),
    "led":         ((1.0, 1.0, 1.0), 0.0, 0.5, (0.60, 1.00, 0.80), 4.0),
}


# ------------------------------------------------------------------- helpers
class Builder:
    """Accumulates axis-aligned boxes, quads and prisms into one mesh."""

    ALL = ("-x", "+x", "-y", "+y", "-z", "+z")

    def __init__(self, name, materials):
        self.name = name
        self.materials = list(materials)
        self.bm = bmesh.new()
        self.color_layer = None
        self.uv_layer = None

    def enable_led_layers(self):
        self.color_layer = self.bm.loops.layers.float_color.new("Col")
        self.uv_layer = self.bm.loops.layers.uv.new("UVMap")

    def _face(self, verts, material):
        face = self.bm.faces.new(verts)
        face.material_index = self.materials.index(material)
        return face

    def box(self, lo, hi, material, faces=ALL):
        x0, y0, z0 = lo
        x1, y1, z1 = hi
        assert x1 > x0 and y1 > y0 and z1 > z0, (self.name, lo, hi)
        v = {
            (i, j, k): self.bm.verts.new(((x0, x1)[i], (y0, y1)[j], (z0, z1)[k]))
            for i in (0, 1) for j in (0, 1) for k in (0, 1)
        }
        quads = {
            "+z": ((0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)),
            "-z": ((0, 0, 0), (0, 1, 0), (1, 1, 0), (1, 0, 0)),
            "-y": ((0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)),
            "+y": ((0, 1, 0), (0, 1, 1), (1, 1, 1), (1, 1, 0)),
            "+x": ((1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1)),
            "-x": ((0, 0, 0), (0, 0, 1), (0, 1, 1), (0, 1, 0)),
        }
        for key in faces:
            self._face([v[c] for c in quads[key]], material)
        # Unused corners of partial boxes are removed in finish().

    def front_quad(self, x0, x1, z0, z1, y, material):
        """A single quad facing -Y (towards the aisle in cabinet-local space)."""
        verts = [self.bm.verts.new(p) for p in ((x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1))]
        return self._face(verts, material)

    def led(self, x, z, color, mode, rng, w=0.009, h=0.005):
        face = self.front_quad(x - w / 2, x + w / 2, z - h / 2, z + h / 2, FRONT_Y - 0.0015, "led")
        phase = rng.random()
        for loop in face.loops:
            loop[self.color_layer] = (*color, 1.0)
            loop[self.uv_layer].uv = (mode, phase)

    def prism_y(self, x, z, radius, y0, y1, material, sides=6):
        rings = []
        for y in (y0, y1):
            rings.append([
                self.bm.verts.new((x + radius * math.cos(2 * math.pi * i / sides), y,
                                   z + radius * math.sin(2 * math.pi * i / sides)))
                for i in range(sides)
            ])
        for i in range(sides):
            j = (i + 1) % sides
            self._face([rings[0][i], rings[1][i], rings[1][j], rings[0][j]], material)

    def finish(self, collection):
        loose = [v for v in self.bm.verts if not v.link_faces]
        bmesh.ops.delete(self.bm, geom=loose, context="VERTS")
        self.bm.normal_update()
        mesh = bpy.data.meshes.new(self.name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        for material in self.materials:
            mesh.materials.append(bpy.data.materials[material])
        if len(mesh.color_attributes):  # LED colours: make them the exported COLOR_0
            mesh.color_attributes.active_color = mesh.color_attributes[0]
            mesh.color_attributes.render_color_index = 0
        obj = bpy.data.objects.new(self.name, mesh)
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


def apply_final_metallic():
    for name, (_base, metallic, *_rest) in MATERIALS.items():
        bsdf = bpy.data.materials[name].node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Metallic"].default_value = metallic


# ------------------------------------------------------------------ cabinets
FRONT5 = ("-x", "+x", "-y", "-z", "+z")  # everything except the hidden back


def unit_server(b, leds, z, rng, height_u=1):
    h = height_u * U - 0.003
    b.box((-BEZEL_HALF, FRONT_Y, z), (BEZEL_HALF, FRONT_Y + 0.02, z + h), "rack_bezel", FRONT5)
    # ears / handles
    for side in (-1, 1):
        x = side * (BEZEL_HALF - 0.012)
        b.box((x - 0.008, FRONT_Y - 0.012, z + 0.006), (x + 0.008, FRONT_Y, z + h - 0.006), "rack_accent", FRONT5)
    # status LEDs
    leds.led(-BEZEL_HALF + 0.040, z + h * 0.68, LED_GREEN, 0.0, rng)
    leds.led(-BEZEL_HALF + 0.056, z + h * 0.68, LED_CYAN if rng.random() < 0.7 else LED_AMBER, 1.0, rng)
    leds.led(-BEZEL_HALF + 0.040, z + h * 0.32, LED_GREEN, 0.5, rng)
    # vent grille: dark recess with slats
    gx0, gx1 = -BEZEL_HALF + 0.075, 0.05
    b.front_quad(gx0, gx1, z + 0.006, z + h - 0.006, FRONT_Y - 0.0006, "rack_vent")
    slats = 3 * height_u
    for i in range(slats):
        sz = z + 0.008 + (h - 0.016) * (i + 0.5) / slats
        b.box((gx0, FRONT_Y - 0.004, sz - 0.0022), (gx1, FRONT_Y, sz + 0.0022), "rack_bezel", ("-y", "+z", "-z"))
    # drive caddies
    cols, rows = 4, height_u
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
            leds.led(x0 + cw - 0.009, z0 + ch - 0.009, LED_GREEN if rng.random() < 0.85 else LED_AMBER, 1.0 if rng.random() < 0.6 else 0.0, rng, 0.006, 0.004)
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
    leds = Builder(f"RackLeds.{variant}", ["led"])
    leds.enable_led_layers()
    hw = RACK_W / 2
    # shell
    b.box((-hw, 0.0, 0.0), (-hw + 0.014, RACK_D, RACK_H), "rack_body")
    b.box((hw - 0.014, 0.0, 0.0), (hw, RACK_D, RACK_H), "rack_body")
    b.box((-hw + 0.014, 0.0, RACK_H - 0.035), (hw - 0.014, RACK_D, RACK_H), "rack_body", ("-y", "+y", "+z", "-z"))
    b.box((-hw + 0.014, 0.012, 0.0), (hw - 0.014, RACK_D, 0.085), "rack_vent", ("-y", "+z"))
    b.box((-hw + 0.014, RACK_D - 0.012, 0.085), (hw - 0.014, RACK_D, RACK_H - 0.035), "rack_body", ("-y", "+y"))
    b.front_quad(-hw + 0.014, hw - 0.014, 0.085, RACK_H - 0.035, FRONT_Y + 0.045, "rack_vent")  # dark interior
    # mounting rails
    for side in (-1, 1):
        x = side * 0.2405
        b.box((x - 0.015, FRONT_Y - 0.004, 0.10), (x + 0.015, FRONT_Y + 0.02, RACK_H - 0.05), "rack_accent", FRONT5)
    # header panel with a status light bar
    b.box((-hw + 0.014, 0.004, UNITS_Z0 + 42 * U + 0.006), (hw - 0.014, 0.03, RACK_H - 0.035), "rack_bezel", ("-y", "-z"))
    bar_z = RACK_H - 0.075
    leds.led(0.0, bar_z, LED_WHITE, 0.0, rng, 0.30, 0.007)
    # units, bottom to top
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


# ---------------------------------------------------------------------- room
def frange(start, stop, step):
    out, value = [], start
    while value < stop - 1e-6:
        out.append(round(value, 5))
        value += step
    return out


def build_floor(collection):
    b = Builder("Floor", ["floor_tile", "floor_vent"])
    rng = random.Random(7)
    gap = 0.003
    for x in frange(-ROOM_HALF_X, ROOM_HALF_X, TILE):
        for y in frange(ROOM_Y0, ROOM_Y1, TILE):
            b.box((x + gap, y + gap, -0.03), (x + TILE - gap, y + TILE - gap, 0.0), "floor_tile", ("+z", "-x", "+x", "-y", "+y"))
            in_aisle = abs(x + TILE / 2) < 0.7
            if in_aisle and rng.random() < 0.3:
                # perforated airflow tile
                n = 6
                cell = (TILE - 0.12) / n
                for i in range(n):
                    for j in range(n):
                        cx = x + 0.06 + (i + 0.5) * cell
                        cy = y + 0.06 + (j + 0.5) * cell
                        verts = [b.bm.verts.new(p) for p in (
                            (cx - cell * 0.32, cy - cell * 0.32, 0.0006), (cx + cell * 0.32, cy - cell * 0.32, 0.0006),
                            (cx + cell * 0.32, cy + cell * 0.32, 0.0006), (cx - cell * 0.32, cy + cell * 0.32, 0.0006))]
                        b._face(verts, "floor_vent")
    return b.finish(collection)


def build_room(collection):
    b = Builder("Room", ["room_dark", "room_panel", "tray_metal", "cable_dark", "cable_teal", "cable_amber", "rack_accent", "rack_body"])
    glow = Builder("RoomGlow", ["light_strip", "footlight", "door_light"])
    rng = random.Random(11)
    xs = frange(-ROOM_HALF_X, ROOM_HALF_X, TILE)
    ys = frange(ROOM_Y0, ROOM_Y1, TILE)
    # ceiling tiles (only the underside is ever seen)
    for x in xs:
        for y in ys:
            b.box((x + 0.004, y + 0.004, CEILING_Z), (x + TILE - 0.004, y + TILE - 0.004, CEILING_Z + 0.02), "room_dark", ("-z",))
    # ceiling grid
    for x in xs + [ROOM_HALF_X]:
        b.box((x - 0.012, ROOM_Y0, CEILING_Z - 0.012), (x + 0.012, ROOM_Y1, CEILING_Z + 0.001), "room_panel", ("-z", "-x", "+x"))
    # side walls, in panels so the vertex bake has something to sample
    for y in ys:
        for z0, z1 in ((0.0, 1.5), (1.5, CEILING_Z)):
            b.box((-ROOM_HALF_X - 0.05, y, z0), (-ROOM_HALF_X, y + TILE, z1), "room_dark", ("+x",))
            b.box((ROOM_HALF_X, y, z0), (ROOM_HALF_X + 0.05, y + TILE, z1), "room_dark", ("-x",))
    # end wall with a double door
    door_half, door_h = 0.85, 2.35
    for x in xs:
        for z0, z1 in ((0.0, 0.75), (0.75, 1.5), (1.5, 2.25), (2.25, CEILING_Z)):
            if x >= -door_half - 0.05 and x + TILE <= door_half + 0.05 and z1 <= door_h + 0.05:
                continue
            b.box((x + 0.003, ROOM_Y1 - 0.2, z0 + 0.003), (x + TILE - 0.003, ROOM_Y1, z1 - 0.003), "room_panel", ("-y", "-x", "+x", "+z", "-z"))
    wall_y = ROOM_Y1 - 0.2
    for side in (-1, 1):  # door leaves, slightly recessed, each with a lit slit
        x0, x1 = (side * door_half, side * 0.008) if side < 0 else (side * 0.008, side * door_half)
        b.box((x0, wall_y + 0.06, 0.0), (x1, wall_y + 0.12, door_h), "rack_body", ("-y",))
        sx = side * 0.42
        glow.box((sx - 0.05, wall_y + 0.045, 0.75), (sx + 0.05, wall_y + 0.06, 1.95), "door_light", ("-y",))
        b.box((side * 0.10 - 0.012, wall_y + 0.02, 0.95), (side * 0.10 + 0.012, wall_y + 0.06, 1.25), "rack_accent", FRONT5)
    b.box((-door_half - 0.07, wall_y - 0.03, door_h), (door_half + 0.07, wall_y + 0.02, door_h + 0.09), "rack_accent", FRONT5)
    for side in (-1, 1):
        b.box((side * (door_half + 0.035) - 0.035, wall_y - 0.03, 0.0), (side * (door_half + 0.035) + 0.035, wall_y + 0.02, door_h), "rack_accent", FRONT5)
    glow.box((-0.5, wall_y - 0.012, door_h + 0.16), (0.5, wall_y, door_h + 0.19), "door_light", ("-y",))  # exit sign bar

    # ceiling light strips over the aisle
    for side in (-1, 1):
        x = side * 0.62
        for y in frange(ROOM_Y0 + 0.6, ROOM_Y1 - 1.4, 1.8):
            b.box((x - 0.07, y, CEILING_Z - 0.05), (x + 0.07, y + 1.25, CEILING_Z - 0.004), "rack_body", ("-x", "+x", "-y", "+y"))
            glow.box((x - 0.045, y + 0.03, CEILING_Z - 0.056), (x + 0.045, y + 1.22, CEILING_Z - 0.05), "light_strip", ("-z",))
    # footlights along the base of both rows
    row_y0 = ROW_START_Y - PITCH / 2
    for side in (-1, 1):
        x = side * (AISLE_HALF - 0.012)
        glow.box((x - 0.006, row_y0, 0.012), (x + 0.006, ROW_END_Y, 0.024), "footlight", ("+z", "-x", "+x"))
    # containment: rails along the cabinet tops and beams across the aisle
    top = RACK_H
    for side in (-1, 1):
        x = side * (AISLE_HALF + 0.02)
        b.box((x - 0.025, row_y0, top), (x + 0.025, ROW_END_Y, top + 0.06), "rack_accent")
    for i in range(0, RACKS_PER_SIDE + 1, 4):
        y = row_y0 + i * PITCH
        b.box((-AISLE_HALF, y - 0.025, top + 0.005), (AISLE_HALF, y + 0.025, top + 0.065), "rack_accent")
    # cable trays above each row, with hangers, rungs, cables and drops
    tray_z = 2.52
    for side in (-1, 1):
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
    return b.finish(collection), glow.finish(collection)


# ----------------------------------------------------------- layout & baking
def slot_transforms():
    """(name, location, rotation_z, variant) for every cabinet position."""
    rng = random.Random(3)
    slots = []
    for side, label in ((-1, "L"), (1, "R")):
        for i in range(RACKS_PER_SIDE):
            variant = rng.choice("AABC")
            y = ROW_START_Y + i * PITCH
            # cabinet-local -Y is its front: turn it to face the aisle centre
            rotation = math.radians(90) if side < 0 else math.radians(-90)
            slots.append((f"Slot.{label}.{i:02d}.{variant}", (side * AISLE_HALF, y, 0.0), rotation, variant))
    return slots


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


def normalise_bake(objects):
    """Scale all baked irradiance by one shared factor so it fits 0..1."""
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
    print(f"bake normalised: p98.5 luminance {reference:.4f}, scale {scale:.3f}, median {lum[len(lum) // 2] * scale:.3f}")


def render_preview(path, samples):
    scene = bpy.context.scene
    camera_data = bpy.data.cameras.new("PreviewCamera")
    camera_data.lens = 24
    camera = bpy.data.objects.new("PreviewCamera", camera_data)
    scene.collection.objects.link(camera)
    camera.location = (0.28, -0.9, 1.35)
    direction = Vector((-0.05, 6.0, 1.3)) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.camera = camera
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.view_settings.view_transform = "Filmic" if "Filmic" in [
        v.identifier for v in bpy.types.ColorManagedViewSettings.bl_rna.properties["view_transform"].enum_items
    ] else scene.view_settings.view_transform
    scene.render.filepath = path
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(camera)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    parser.add_argument("--preview")
    parser.add_argument("--samples", type=int, default=96)
    args = parser.parse_args(argv)

    addon_utils.enable("cycles", default_set=True)
    addon_utils.enable("io_scene_gltf2", default_set=True)
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

    make_materials()
    floor = build_floor(collection)
    room, glow = build_room(collection)
    racks, led_meshes = {}, {}
    for variant, seed in (("A", 101), ("B", 202), ("C", 303)):
        racks[variant], led_meshes[variant] = build_rack(variant, seed, collection)

    # Stand a cabinet in every slot so the bake sees the real surroundings.
    slots = slot_transforms()
    stand_ins, home = [], {}
    for name, location, rotation, variant in slots:
        if variant not in home and name.split(".")[1] == "R" and 5 <= int(name.split(".")[2]) <= 11:
            home[variant] = (location, rotation)
            continue
        for source in (racks[variant], led_meshes[variant]):
            copy = bpy.data.objects.new(f"standin.{name}.{source.name}", source.data)
            copy.location, copy.rotation_euler = location, (0.0, 0.0, rotation)
            collection.objects.link(copy)
            stand_ins.append(copy)
    assert set(home) == {"A", "B", "C"}, home
    for variant, (location, rotation) in home.items():
        for source in (racks[variant], led_meshes[variant]):
            source.location, source.rotation_euler = location, (0.0, 0.0, rotation)
    bpy.context.view_layer.update()

    baked = [floor, room, *racks.values()]
    bake(baked, args.samples)
    normalise_bake(baked)
    apply_final_metallic()

    if args.preview:
        render_preview(args.preview, max(48, args.samples))

    for copy in stand_ins:
        bpy.data.objects.remove(copy)
    for source in (*racks.values(), *led_meshes.values()):
        source.location, source.rotation_euler = (0.0, 0.0, 0.0), (0.0, 0.0, 0.0)
    for name, location, rotation, _variant in slots:
        empty = bpy.data.objects.new(name, None)
        empty.location, empty.rotation_euler = location, (0.0, 0.0, rotation)
        collection.objects.link(empty)
    bpy.context.view_layer.update()

    stats = {o.name: len(o.data.loop_triangles) or sum(len(p.vertices) - 2 for p in o.data.polygons)
             for o in scene.objects if o.type == "MESH"}
    print("triangles:", stats)

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
