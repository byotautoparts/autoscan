import { useState, useRef, useCallback, useEffect } from "react";

const VISION_KEY = import.meta.env.VITE_GOOGLE_VISION_KEY || "";
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

const PRICES = {
  "A/C COMPRESSOR":{"waco":44.99,"bryan":44.99,"beaumont":44.99,"batonRouge":44.99,"jackson":44.99},
  "A/C CONDENSER":{"waco":29.99,"bryan":29.99,"beaumont":29.99,"batonRouge":29.99,"jackson":29.99},
  "A/C EVAPORATOR":{"waco":24.99,"bryan":24.99,"beaumont":24.99,"batonRouge":24.99,"jackson":24.99},
  "A/C DRYER":{"waco":11.99,"bryan":11.99,"beaumont":11.99,"batonRouge":11.99,"jackson":11.99},
  "A/C HOSE SINGLE":{"waco":16.99,"bryan":16.99,"beaumont":16.99,"batonRouge":16.99,"jackson":16.99},
  "A/C HOSE DOUBLE":{"waco":19.99,"bryan":19.99,"beaumont":19.99,"batonRouge":19.99,"jackson":19.99},
  "ALTERNATOR":{"waco":30.99,"bryan":30.99,"beaumont":30.99,"batonRouge":30.99,"jackson":30.99},
  "AXLE (ONE SIDE)":{"waco":50.99,"bryan":50.99,"beaumont":50.99,"batonRouge":50.99,"jackson":50.99},
  "AXLE SHAFT SOLID TYPE":{"waco":22.99,"bryan":22.99,"beaumont":22.99,"batonRouge":22.99,"jackson":22.99},
  "BACK GLASS":{"waco":31.99,"bryan":31.99,"beaumont":31.99,"batonRouge":31.99,"jackson":31.99},
  "BATTERY (USED)":{"waco":35.99,"bryan":35.99,"beaumont":35.99,"batonRouge":35.99,"jackson":35.99},
  "BATTERY (USED) PREMIUM":{"waco":59.99,"bryan":59.99,"beaumont":59.99,"batonRouge":59.99,"jackson":59.99},
  "BEARING (ANY)":{"waco":7.99,"bryan":7.99,"beaumont":7.99,"batonRouge":7.99,"jackson":7.99},
  "BED LINER":{"waco":29.99,"bryan":29.99,"beaumont":29.99,"batonRouge":29.99,"jackson":29.99},
  "BELLHOUSING":{"waco":22.99,"bryan":22.99,"beaumont":22.99,"batonRouge":22.99,"jackson":22.99},
  "BELT TENSIONER":{"waco":19.99,"bryan":19.99,"beaumont":19.99,"batonRouge":19.99,"jackson":19.99},
  "BLEND DOOR ACTUATOR":{"waco":14.99,"bryan":14.99,"beaumont":14.99,"batonRouge":14.99,"jackson":14.99},
  "BLOWER MOTOR RESISTOR":{"waco":9.99,"bryan":9.99,"beaumont":9.99,"batonRouge":9.99,"jackson":9.99},
  "BODY CONTROL MODULE":{"waco":24.99,"bryan":24.99,"beaumont":24.99,"batonRouge":24.99,"jackson":24.99},
  "BRAKE ABS MODULE":{"waco":26.99,"bryan":26.99,"beaumont":26.99,"batonRouge":26.99,"jackson":26.99},
  "BRAKE ABS PUMP W/MODULE":{"waco":49.99,"bryan":49.99,"beaumont":49.99,"batonRouge":49.99,"jackson":49.99},
  "BRAKE ABS PUMP WO MODULE":{"waco":39.99,"bryan":39.99,"beaumont":39.99,"batonRouge":39.99,"jackson":39.99},
  "BRAKE BOOSTER":{"waco":32.99,"bryan":32.99,"beaumont":32.99,"batonRouge":32.99,"jackson":32.99},
  "BRAKE CALIPER":{"waco":16.99,"bryan":16.99,"beaumont":16.99,"batonRouge":16.99,"jackson":16.99},
  "BRAKE DRUM W/HUB":{"waco":21.99,"bryan":21.99,"beaumont":21.99,"batonRouge":21.99,"jackson":21.99},
  "BRAKE DRUM (NO HUB)":{"waco":14.99,"bryan":14.99,"beaumont":14.99,"batonRouge":14.99,"jackson":14.99},
  "BRAKE MASTER CYLINDER":{"waco":19.99,"bryan":19.99,"beaumont":19.99,"batonRouge":19.99,"jackson":19.99},
  "BRAKE ROTOR (NO HUB)":{"waco":14.99,"bryan":14.99,"beaumont":14.99,"batonRouge":14.99,"jackson":14.99},
  "BRAKE ROTOR W/HUB":{"waco":25.99,"bryan":25.99,"beaumont":25.99,"batonRouge":25.99,"jackson":25.99},
  "BRAKE SHOE/PAD (EA)":{"waco":2.49,"bryan":2.49,"beaumont":2.49,"batonRouge":2.49,"jackson":2.49},
  "BUMPER ASSEMBLY CAR":{"waco":69.99,"bryan":69.99,"beaumont":69.99,"batonRouge":69.99,"jackson":69.99},
  "BUMPER ASSEMBLY TRUCK":{"waco":73.99,"bryan":73.99,"beaumont":73.99,"batonRouge":73.99,"jackson":73.99},
  "BUMPER COVER BARE":{"waco":49.99,"bryan":49.99,"beaumont":49.99,"batonRouge":49.99,"jackson":49.99},
  "BUMPER REINFORCEMENT":{"waco":24.99,"bryan":24.99,"beaumont":24.99,"batonRouge":24.99,"jackson":24.99},
  "CAM SHAFT":{"waco":29.99,"bryan":29.99,"beaumont":29.99,"batonRouge":29.99,"jackson":29.99},
  "CAM SHAFT SENSOR":{"waco":13.99,"bryan":13.99,"beaumont":13.99,"batonRouge":13.99,"jackson":13.99},
  "CAMERA (ANY)":{"waco":19.99,"bryan":19.99,"beaumont":19.99,"batonRouge":19.99,"jackson":19.99},
  "CANISTER PURGE VALVE":{"waco":15.99,"bryan":15.99,"beaumont":15.99,"batonRouge":15.99,"jackson":15.99},
  "CARBURETOR 2 BARREL":{"waco":32.99,"bryan":32.99,"beaumont":32.99,"batonRouge":32.99,"jackson":32.99},
  "CARBURETOR 4 BARREL":{"waco":49.99,"bryan":49.99,"beaumont":49.99,"batonRouge":49.99,"jackson":49.99},
  "CARPET":{"waco":18.99,"bryan":18.99,"beaumont":18.99,"batonRouge":18.99,"jackson":18.99},
  "CARRIER BEARING":{"waco":14.99,"bryan":14.99,"beaumont":14.99,"batonRouge":14.99,"jackson":14.99},
  "CARRIER HOUSING":{"waco":42.99,"bryan":42.99,"beaumont":42.99,"batonRouge":42.99,"jackson":42.99},
  "CHARCOAL CANISTER":{"waco":11.99,"bryan":11.99,"beaumont":11.99,"batonRouge":11.99,"jackson":11.99},
  "CLOCK SPRING":{"waco":25.99,"bryan":25.99,"beaumont":25.99,"batonRouge":25.99,"jackson":25.99},
  "CLUTCH DISC":{"waco":13.99,"bryan":13.99,"beaumont":13.99,"batonRouge":13.99,"jackson":13.99},
  "COIL (SINGLE)":{"waco":11.99,"bryan":11.99,"beaumont":11.99,"batonRouge":11.99,"jackson":11.99},
  "COIL PACK":{"waco":30.99,"bryan":30.99,"beaumont":30.99,"batonRouge":30.99,"jackson":30.99},
  "COIL SPRING":{"waco":17.99,"bryan":17.99,"beaumont":17.99,"batonRouge":17.99,"jackson":17.99},
  "COMPUTER BRAIN BOX":{"waco":45.99,"bryan":45.99,"beaumont":45.99,"batonRouge":45.99,"jackson":45.99},
  "CONTROL ARM":{"waco":24.99,"bryan":24.99,"beaumont":24.99,"batonRouge":24.99,"jackson":24.99},
  "CRANKSHAFT":{"waco":45.99,"bryan":45.99,"beaumont":45.99,"batonRouge":45.99,"jackson":45.99},
  "CRANKSHAFT SENSOR":{"waco":13.99,"bryan":13.99,"beaumont":13.99,"batonRouge":13.99,"jackson":13.99},
  "CV HALF SHAFT AXLE":{"waco":20.99,"bryan":20.99,"beaumont":20.99,"batonRouge":20.99,"jackson":20.99},
  "C-V AXLE FRONT DRIVE":{"waco":29.99,"bryan":29.99,"beaumont":29.99,"batonRouge":29.99,"jackson":29.99},
  "CYL HEAD-DOHC ANY":{"waco":99.99,"bryan":99.99,"beaumont":99.99,"batonRouge":99.99,"jackson":99.99},
  "CYL HEAD-OHV STEEL":{"waco":67.99,"bryan":67.99,"beaumont":67.99,"batonRouge":67.99,"jackson":67.99},
  "CYL HEAD-SOHC ALUM":{"waco":79.99,"bryan":79.99,"beaumont":79.99,"batonRouge":79.99,"jackson":79.99},
  "CYL HEAD-SOHC STEEL":{"waco":79.99,"bryan":79.99,"beaumont":79.99,"batonRouge":79.99,"jackson":79.99},
  "DASH (BARE)":{"waco":39.99,"bryan":39.99,"beaumont":39.99,"batonRouge":39.99,"jackson":39.99},
  "DASH (LOADED)":{"waco":88.99,"bryan":88.99,"beaumont":88.99,"batonRouge":88.99,"jackson":88.99},
  "DIESEL INJECTOR PUMP":{"waco":39.99,"bryan":39.99,"beaumont":39.99,"batonRouge":39.99,"jackson":39.99},
  "DISTRIBUTOR":{"waco":35.99,"bryan":35.99,"beaumont":35.99,"batonRouge":35.99,"jackson":35.99},
  "DOOR (CAR)":{"waco":67.99,"bryan":67.99,"beaumont":67.99,"batonRouge":67.99,"jackson":67.99},
  "DOOR (SLIDING VAN)":{"waco":77.99,"bryan":77.99,"beaumont":77.99,"batonRouge":77.99,"jackson":77.99},
  "DOOR (TRUCK)":{"waco":70.99,"bryan":70.99,"beaumont":70.99,"batonRouge":70.99,"jackson":70.99},
  "DOOR BARE (CAR)":{"waco":49.99,"bryan":49.99,"beaumont":49.99,"batonRouge":49.99,"jackson":49.99},
  "DOOR BARE (TRUCK)":{"waco":52.99,"bryan":52.99,"beaumont":52.99,"batonRouge":52.99,"jackson":52.99},
  "DOOR GLASS":{"waco":30.99,"bryan":30.99,"beaumont":30.99,"batonRouge":30.99,"jackson":30.99},
  "DOOR HANDLE OUTSIDE":{"waco":12.99,"bryan":12.99,"beaumont":12.99,"batonRouge":12.99,"jackson":12.99},
  "DOOR HINGE":{"waco":8.99,"bryan":8.99,"beaumont":8.99,"batonRouge":8.99,"jackson":8.99},
  "DOOR LOCK ACTUATOR":{"waco":10.99,"bryan":10.99,"beaumont":10.99,"batonRouge":10.99,"jackson":10.99},
  "DOOR SKIN":{"waco":24.99,"bryan":24.99,"beaumont":24.99,"batonRouge":24.99,"jackson":24.99},
  "DRIVE SHAFT":{"waco":28.99,"bryan":28.99,"beaumont":28.99,"batonRouge":28.99,"jackson":28.99},
  "ENGINE SHORT BLOCK":{"waco":199.99,"bryan":199.99,"beaumont":199.99,"batonRouge":199.99,"jackson":199.99},
  "ENGINE-DIESEL":{"waco":309.99,"bryan":309.99,"beaumont":309.99,"batonRouge":309.99,"jackson":309.99},
  "ENGINE-DIESEL W/ACC":{"waco":359.99,"bryan":359.99,"beaumont":359.99,"batonRouge":359.99,"jackson":359.99},
  "ENGINE-GAS":{"waco":249.99,"bryan":249.99,"beaumont":249.99,"batonRouge":249.99,"jackson":249.99},
  "ENGINE-GAS W/ACC":{"waco":279.99,"bryan":279.99,"beaumont":279.99,"batonRouge":279.99,"jackson":279.99},
  "EXHAUST MANIFOLD":{"waco":26.99,"bryan":26.99,"beaumont":26.99,"batonRouge":26.99,"jackson":26.99},
  "FAN ASSY DBL (ELEC)":{"waco":40.99,"bryan":40.99,"beaumont":40.99,"batonRouge":40.99,"jackson":40.99},
  "FAN ASSY SNGL (ELEC)":{"waco":30.99,"bryan":30.99,"beaumont":30.99,"batonRouge":30.99,"jackson":30.99},
  "FAN CLUTCH":{"waco":12.99,"bryan":12.99,"beaumont":12.99,"batonRouge":12.99,"jackson":12.99},
  "FENDER BARE (CAR)":{"waco":48.99,"bryan":48.99,"beaumont":48.99,"batonRouge":48.99,"jackson":48.99},
  "FENDER BARE (TRUCK)":{"waco":52.99,"bryan":52.99,"beaumont":52.99,"batonRouge":52.99,"jackson":52.99},
  "FLYWHEEL":{"waco":21.99,"bryan":21.99,"beaumont":21.99,"batonRouge":21.99,"jackson":21.99},
  "FOG LIGHT":{"waco":12.99,"bryan":12.99,"beaumont":12.99,"batonRouge":12.99,"jackson":12.99},
  "FRONT AXLE ASSY 4X4":{"waco":199.99,"bryan":199.99,"beaumont":199.99,"batonRouge":199.99,"jackson":199.99},
  "FRONT CLIP CAR":{"waco":369.99,"bryan":369.99,"beaumont":369.99,"batonRouge":369.99,"jackson":369.99},
  "FRONT CLIP TRUCK":{"waco":399.99,"bryan":399.99,"beaumont":399.99,"batonRouge":399.99,"jackson":399.99},
  "FUEL INJECTOR (EACH)":{"waco":9.99,"bryan":9.99,"beaumont":9.99,"batonRouge":9.99,"jackson":9.99},
  "FUEL PUMP ELECTRIC":{"waco":32.99,"bryan":32.99,"beaumont":32.99,"batonRouge":32.99,"jackson":32.99},
  "FUEL TANK SEND PUMP":{"waco":35.99,"bryan":35.99,"beaumont":35.99,"batonRouge":35.99,"jackson":35.99},
  "FUSE BOX (BARE)":{"waco":19.99,"bryan":19.99,"beaumont":19.99,"batonRouge":19.99,"jackson":19.99},
  "FUSE BOX (LOADED)":{"waco":29.99,"bryan":29.99,"beaumont":29.99,"batonRouge":29.99,"jackson":29.99},
  "FUSE BOX W/PWR MOD":{"waco":155.99,"bryan":155.99,"beaumont":155.99,"batonRouge":155.99,"jackson":155.99},
  "GLASS HATCH":{"waco":38.99,"bryan":38.99,"beaumont":38.99,"batonRouge":38.99,"jackson":38.99},
  "GRILLE CAR":{"waco":26.99,"bryan":26.99,"beaumont":26.99,"batonRouge":26.99,"jackson":26.99},
  "GRILLE TRUCK":{"waco":32.99,"bryan":32.99,"beaumont":32.99,"batonRouge":32.99,"jackson":32.99},
  "HARMONIC BALANCER":{"waco":27.99,"bryan":27.99,"beaumont":27.99,"batonRouge":27.99,"jackson":27.99},
  "HEADLAMP COMP. LARGE":{"waco":33.99,"bryan":33.99,"beaumont":33.99,"batonRouge":33.99,"jackson":33.99},
  "HEADLAMP COMP. SMALL":{"waco":21.99,"bryan":21.99,"beaumont":21.99,"batonRouge":21.99,"jackson":21.99},
  "HEADLIGHT LED":{"waco":25.99,"bryan":25.99,"beaumont":25.99,"batonRouge":25.99,"jackson":25.99},
  "HEATER BLOWER MOTOR":{"waco":23.99,"bryan":23.99,"beaumont":23.99,"batonRouge":23.99,"jackson":23.99},
  "HEATER CORE":{"waco":15.99,"bryan":15.99,"beaumont":15.99,"batonRouge":15.99,"jackson":15.99},
  "HI PRESSURE OIL PUMP":{"waco":171.99,"bryan":171.99,"beaumont":171.99,"batonRouge":171.99,"jackson":171.99},
  "HOOD (CAR)":{"waco":55.99,"bryan":55.99,"beaumont":55.99,"batonRouge":55.99,"jackson":55.99},
  "HOOD (TRUCK)":{"waco":58.99,"bryan":58.99,"beaumont":58.99,"batonRouge":58.99,"jackson":58.99},
  "HUB & BEARING ONLY":{"waco":29.99,"bryan":29.99,"beaumont":29.99,"batonRouge":29.99,"jackson":29.99},
  "HUB/KNUCK ASSY (CAR)":{"waco":39.99,"bryan":39.99,"beaumont":39.99,"batonRouge":39.99,"jackson":39.99},
  "HUB/KNUCK ASSY (TRUCK)":{"waco":43.99,"bryan":43.99,"beaumont":43.99,"batonRouge":43.99,"jackson":43.99},
  "HYBRID BATTERY":{"waco":125.99,"bryan":125.99,"beaumont":125.99,"batonRouge":125.99,"jackson":125.99},
  "IDLE AIR CONTROL VALVE":{"waco":20.99,"bryan":20.99,"beaumont":20.99,"batonRouge":20.99,"jackson":20.99},
  "IGNITION SWITCH":{"waco":15.99,"bryan":15.99,"beaumont":15.99,"batonRouge":15.99,"jackson":15.99},
  "INSTRUMENT CLUSTER":{"waco":35.99,"bryan":35.99,"beaumont":35.99,"batonRouge":35.99,"jackson":35.99},
  "INTAKE MANIFOLD (1PC)":{"waco":37.99,"bryan":37.99,"beaumont":37.99,"batonRouge":37.99,"jackson":37.99},
  "INTAKE MANIFOLD (2PC)":{"waco":55.99,"bryan":55.99,"beaumont":55.99,"batonRouge":55.99,"jackson":55.99},
  "INTERIOR DOOR PANEL":{"waco":21.99,"bryan":21.99,"beaumont":21.99,"batonRouge":21.99,"jackson":21.99},
  "LEAF SPRING":{"waco":24.99,"bryan":24.99,"beaumont":24.99,"batonRouge":24.99,"jackson":24.99},
  "LED TAIL LIGHT LARGE":{"waco":39.99,"bryan":39.99,"beaumont":39.99,"batonRouge":39.99,"jackson":39.99},
  "LED TAIL LIGHT SMALL":{"waco":27.99,"bryan":27.99,"beaumont":27.99,"batonRouge":27.99,"jackson":27.99},
  "M.A.F. SENSOR":{"waco":33.99,"bryan":33.99,"beaumont":33.99,"batonRouge":33.99,"jackson":33.99},
  "M.A.P. SENSOR":{"waco":12.99,"bryan":12.99,"beaumont":12.99,"batonRouge":12.99,"jackson":12.99},
  "MUFFLER (ANY)":{"waco":15.99,"bryan":15.99,"beaumont":15.99,"batonRouge":15.99,"jackson":15.99},
  "OIL PAN":{"waco":19.99,"bryan":19.99,"beaumont":19.99,"batonRouge":19.99,"jackson":19.99},
  "OIL PAN - ALUMINUM":{"waco":23.99,"bryan":23.99,"beaumont":23.99,"batonRouge":23.99,"jackson":23.99},
  "OIL PUMP":{"waco":20.99,"bryan":20.99,"beaumont":20.99,"batonRouge":20.99,"jackson":20.99},
  "PISTON AND ROD ASSY":{"waco":27.99,"bryan":27.99,"beaumont":27.99,"batonRouge":27.99,"jackson":27.99},
  "POWER MIRROR - DOOR":{"waco":27.99,"bryan":27.99,"beaumont":27.99,"batonRouge":27.99,"jackson":27.99},
  "POWER STEERING PUMP":{"waco":28.99,"bryan":28.99,"beaumont":28.99,"batonRouge":28.99,"jackson":28.99},
  "POWER STEERING PUMP ELECTRIC":{"waco":44.99,"bryan":44.99,"beaumont":44.99,"batonRouge":44.99,"jackson":44.99},
  "RACK AND PINION CAR":{"waco":49.99,"bryan":49.99,"beaumont":49.99,"batonRouge":49.99,"jackson":49.99},
  "RACK AND PINION ELEC":{"waco":66.99,"bryan":66.99,"beaumont":66.99,"batonRouge":66.99,"jackson":66.99},
  "RACK AND PINION TRUCK":{"waco":59.99,"bryan":59.99,"beaumont":59.99,"batonRouge":59.99,"jackson":59.99},
  "RADIATOR CAR":{"waco":56.99,"bryan":56.99,"beaumont":56.99,"batonRouge":56.99,"jackson":56.99},
  "RADIATOR TRUCK":{"waco":62.99,"bryan":62.99,"beaumont":62.99,"batonRouge":62.99,"jackson":62.99},
  "RADIO (NO CD)":{"waco":18.99,"bryan":18.99,"beaumont":18.99,"batonRouge":18.99,"jackson":18.99},
  "RADIO W/ SCREEN":{"waco":54.99,"bryan":54.99,"beaumont":54.99,"batonRouge":54.99,"jackson":54.99},
  "RADIO W/CD PLAYER":{"waco":31.99,"bryan":31.99,"beaumont":31.99,"batonRouge":31.99,"jackson":31.99},
  "REAR HATCH ASSY":{"waco":114.99,"bryan":114.99,"beaumont":114.99,"batonRouge":114.99,"jackson":114.99},
  "REAR QUARTER PANEL":{"waco":63.99,"bryan":63.99,"beaumont":63.99,"batonRouge":63.99,"jackson":63.99},
  "REAREND DIFF. CARRIER":{"waco":67.99,"bryan":67.99,"beaumont":67.99,"batonRouge":67.99,"jackson":67.99},
  "REAREND HOUSING BARE":{"waco":63.99,"bryan":63.99,"beaumont":63.99,"batonRouge":63.99,"jackson":63.99},
  "REAREND NO BRAKE-CAR":{"waco":149.99,"bryan":149.99,"beaumont":149.99,"batonRouge":149.99,"jackson":149.99},
  "REAREND NO BRAKE-TRUCK":{"waco":168.99,"bryan":168.99,"beaumont":168.99,"batonRouge":168.99,"jackson":168.99},
  "REAREND W/BRAKE (CAR)":{"waco":159.99,"bryan":159.99,"beaumont":159.99,"batonRouge":159.99,"jackson":159.99},
  "REAREND W/BRAKE (TRUCK)":{"waco":179.99,"bryan":179.99,"beaumont":179.99,"batonRouge":179.99,"jackson":179.99},
  "ROCKER ARM ASSY":{"waco":30.99,"bryan":30.99,"beaumont":30.99,"batonRouge":30.99,"jackson":30.99},
  "RUNNING BOARD (FACTORY)":{"waco":24.99,"bryan":24.99,"beaumont":24.99,"batonRouge":24.99,"jackson":24.99},
  "SEAT BELT":{"waco":11.99,"bryan":11.99,"beaumont":11.99,"batonRouge":11.99,"jackson":11.99},
  "SEAT BELT ASSEMBLY":{"waco":16.99,"bryan":16.99,"beaumont":16.99,"batonRouge":16.99,"jackson":16.99},
  "SEAT- 60/40 BENCH":{"waco":43.99,"bryan":43.99,"beaumont":43.99,"batonRouge":43.99,"jackson":43.99},
  "SEAT-BENCH-CLOTH":{"waco":34.99,"bryan":34.99,"beaumont":34.99,"batonRouge":34.99,"jackson":34.99},
  "SEAT-BENCH-LEATHER":{"waco":60.99,"bryan":60.99,"beaumont":60.99,"batonRouge":60.99,"jackson":60.99},
  "SEAT-BUCKET-CLOTH":{"waco":28.99,"bryan":28.99,"beaumont":28.99,"batonRouge":28.99,"jackson":28.99},
  "SEAT-BUCKET-LEATHER":{"waco":44.99,"bryan":44.99,"beaumont":44.99,"batonRouge":44.99,"jackson":44.99},
  "SHOCK - STANDARD":{"waco":9.99,"bryan":9.99,"beaumont":9.99,"batonRouge":9.99,"jackson":9.99},
  "SKID PLATE":{"waco":26.99,"bryan":26.99,"beaumont":26.99,"batonRouge":26.99,"jackson":26.99},
  "SLAVE CYLINDER":{"waco":18.99,"bryan":18.99,"beaumont":18.99,"batonRouge":18.99,"jackson":18.99},
  "STARTER":{"waco":30.99,"bryan":30.99,"beaumont":30.99,"batonRouge":30.99,"jackson":30.99},
  "STEERING COLUMN BARE":{"waco":34.99,"bryan":34.99,"beaumont":34.99,"batonRouge":34.99,"jackson":34.99},
  "STEERING COL. W/O AIRBAG":{"waco":44.99,"bryan":44.99,"beaumont":44.99,"batonRouge":44.99,"jackson":44.99},
  "STEERING GEAR BOX":{"waco":29.99,"bryan":29.99,"beaumont":29.99,"batonRouge":29.99,"jackson":29.99},
  "STEERING WHEEL":{"waco":13.99,"bryan":13.99,"beaumont":13.99,"batonRouge":13.99,"jackson":13.99},
  "STRUT ASSEMBLY":{"waco":27.99,"bryan":27.99,"beaumont":27.99,"batonRouge":27.99,"jackson":27.99},
  "STRUT MOUNT":{"waco":4.99,"bryan":4.99,"beaumont":4.99,"batonRouge":4.99,"jackson":4.99},
  "SUB FRAME - LARGE":{"waco":169.99,"bryan":169.99,"beaumont":169.99,"batonRouge":169.99,"jackson":169.99},
  "SUB FRAME - SMALL":{"waco":149.99,"bryan":149.99,"beaumont":149.99,"batonRouge":149.99,"jackson":149.99},
  "SUNROOF ELECTRIC":{"waco":39.99,"bryan":39.99,"beaumont":39.99,"batonRouge":39.99,"jackson":39.99},
  "SUPERCHARGER":{"waco":78.99,"bryan":78.99,"beaumont":78.99,"batonRouge":78.99,"jackson":78.99},
  "SWAY BAR":{"waco":22.99,"bryan":22.99,"beaumont":22.99,"batonRouge":22.99,"jackson":22.99},
  "TAIL GATE":{"waco":59.99,"bryan":59.99,"beaumont":59.99,"batonRouge":59.99,"jackson":59.99},
  "TAIL LIGHT ASSY LARGE":{"waco":26.99,"bryan":26.99,"beaumont":26.99,"batonRouge":26.99,"jackson":26.99},
  "TAIL LIGHT ASSY SMALL":{"waco":19.99,"bryan":19.99,"beaumont":19.99,"batonRouge":19.99,"jackson":19.99},
  "TAILLIGHT PANEL ASSY":{"waco":57.99,"bryan":57.99,"beaumont":57.99,"batonRouge":57.99,"jackson":57.99},
  "THIRD BRAKE LIGHT":{"waco":16.99,"bryan":16.99,"beaumont":16.99,"batonRouge":16.99,"jackson":16.99},
  "THROTTLE BODY W/SENS":{"waco":45.99,"bryan":45.99,"beaumont":45.99,"batonRouge":45.99,"jackson":45.99},
  "THROTTLE BODY W/O SENSOR":{"waco":31.99,"bryan":31.99,"beaumont":31.99,"batonRouge":31.99,"jackson":31.99},
  "TIE ROD EACH":{"waco":12.99,"bryan":12.99,"beaumont":12.99,"batonRouge":12.99,"jackson":12.99},
  "TIE ROD END":{"waco":7.99,"bryan":7.99,"beaumont":7.99,"batonRouge":7.99,"jackson":7.99},
  "TIMING CHAIN":{"waco":9.99,"bryan":9.99,"beaumont":9.99,"batonRouge":9.99,"jackson":9.99},
  "TORQUE CONVERTER":{"waco":32.99,"bryan":32.99,"beaumont":32.99,"batonRouge":32.99,"jackson":32.99},
  "TORSION BAR":{"waco":22.99,"bryan":22.99,"beaumont":22.99,"batonRouge":22.99,"jackson":22.99},
  "TRANSFER CASE (4X4)":{"waco":89.99,"bryan":89.99,"beaumont":89.99,"batonRouge":89.99,"jackson":89.99},
  "TRANSMISSION FWD":{"waco":164.99,"bryan":164.99,"beaumont":164.99,"batonRouge":164.99,"jackson":164.99},
  "TRANSMISSION RWD":{"waco":184.99,"bryan":184.99,"beaumont":184.99,"batonRouge":184.99,"jackson":184.99},
  "TRANSMISSION MOUNT":{"waco":11.99,"bryan":11.99,"beaumont":11.99,"batonRouge":11.99,"jackson":11.99},
  "TRANSMISSION PUMP":{"waco":79.99,"bryan":79.99,"beaumont":79.99,"batonRouge":79.99,"jackson":79.99},
  "TRANS VALVE BODY":{"waco":55.99,"bryan":55.99,"beaumont":55.99,"batonRouge":55.99,"jackson":55.99},
  "TRANS CONTROL MODULE":{"waco":41.99,"bryan":41.99,"beaumont":41.99,"batonRouge":41.99,"jackson":41.99},
  "TRUCK BED BARE":{"waco":239.99,"bryan":239.99,"beaumont":239.99,"batonRouge":239.99,"jackson":239.99},
  "TRUCK BED LOADED":{"waco":269.99,"bryan":269.99,"beaumont":269.99,"batonRouge":269.99,"jackson":269.99},
  "TRUCK BED COVER-HARD":{"waco":62.99,"bryan":62.99,"beaumont":62.99,"batonRouge":62.99,"jackson":62.99},
  "TRUNK LID BARE":{"waco":44.99,"bryan":44.99,"beaumont":44.99,"batonRouge":44.99,"jackson":44.99},
  "TRUNK LID LOADED":{"waco":108.99,"bryan":108.99,"beaumont":108.99,"batonRouge":108.99,"jackson":108.99},
  "TURBO CHARGER":{"waco":74.99,"bryan":74.99,"beaumont":74.99,"batonRouge":74.99,"jackson":74.99},
  "TURBO INNER COOLER":{"waco":50.99,"bryan":50.99,"beaumont":50.99,"batonRouge":50.99,"jackson":50.99},
  "V10/DSL ENGINE BLOCK":{"waco":289.99,"bryan":289.99,"beaumont":289.99,"batonRouge":289.99,"jackson":289.99},
  "VACUUM PUMP":{"waco":26.99,"bryan":26.99,"beaumont":26.99,"batonRouge":26.99,"jackson":26.99},
  "VALVE COVER":{"waco":9.99,"bryan":9.99,"beaumont":9.99,"batonRouge":9.99,"jackson":9.99},
  "WATER PUMP":{"waco":12.99,"bryan":12.99,"beaumont":12.99,"batonRouge":12.99,"jackson":12.99},
  "WATER PUMP (ELECTRIC)":{"waco":23.99,"bryan":23.99,"beaumont":23.99,"batonRouge":23.99,"jackson":23.99},
  "WHEEL ALUMINUM":{"waco":31.99,"bryan":31.99,"beaumont":31.99,"batonRouge":31.99,"jackson":31.99},
  "WHEEL STEEL":{"waco":14.99,"bryan":14.99,"beaumont":14.99,"batonRouge":14.99,"jackson":14.99},
  "WHEEL SPEED/ABS SENSOR":{"waco":13.99,"bryan":13.99,"beaumont":13.99,"batonRouge":13.99,"jackson":13.99},
  "WINDOW MOTOR":{"waco":19.99,"bryan":19.99,"beaumont":19.99,"batonRouge":19.99,"jackson":19.99},
  "WINDOW REG. W/MOTOR":{"waco":30.99,"bryan":30.99,"beaumont":30.99,"batonRouge":30.99,"jackson":30.99},
  "WINDSHIELD":{"waco":32.99,"bryan":32.99,"beaumont":32.99,"batonRouge":32.99,"jackson":32.99},
  "WIPER MOTOR":{"waco":19.99,"bryan":19.99,"beaumont":19.99,"batonRouge":19.99,"jackson":19.99},
  "WIRE HARNESS >6FT":{"waco":44.99,"bryan":44.99,"beaumont":44.99,"batonRouge":44.99,"jackson":44.99},
  "WIRE HARNESS <4FT":{"waco":18.99,"bryan":18.99,"beaumont":18.99,"batonRouge":18.99,"jackson":18.99},
  "WIRE HARNESS 4TO6FT":{"waco":31.99,"bryan":31.99,"beaumont":31.99,"batonRouge":31.99,"jackson":31.99},
};

const LOCATIONS = [
  {key:"waco",label:"Waco, TX"},
  {key:"bryan",label:"Bryan, TX"},
  {key:"beaumont",label:"Beaumont, TX"},
  {key:"batonRouge",label:"Baton Rouge, LA"},
  {key:"jackson",label:"Jackson, MS"},
];

function findPrice(partName) {
  if (!partName) return null;
  const n = partName.toUpperCase().trim();
  if (PRICES[n]) return PRICES[n];
  let best = null, bestScore = 0;
  for (const k of Object.keys(PRICES)) {
    const hits = k.split(" ").filter(w => w.length > 2 && n.includes(w)).length;
    const score = hits / Math.max(k.split(" ").length, 1);
    if (score > bestScore) { bestScore = score; best = k; }
  }
  return bestScore > 0.4 ? PRICES[best] : null;
}

const N = "#39ff14";
const C = {
  bg:"#000", surface:"#0d0d0d", card:"#111", cardHi:"#161616",
  border:"#1e1e1e", borderHi:"#2a2a2a",
  neon:N, neonDim:"#1a3d0a", neonBorder:"#2a5c12",
  white:"#ffffff", textMid:"#aaa", textDim:"#666", textFaint:"#333",
  red:"#ff3b3b", redDim:"#2a0000", redBorder:"#5c0000",
  amber:"#ffb800", blue:"#4da6ff", blueDim:"#001a33", blueBorder:"#003366",
};
const COND = {
  Good:{bg:"#051205",text:N,border:"#1a4a1a"},
  Fair:{bg:"#1a1000",text:"#ffb800",border:"#4a3000"},
  Worn:{bg:"#1a0800",text:"#ff8c00",border:"#4a2000"},
  Damaged:{bg:"#2a0000",text:"#ff3b3b",border:"#5c0000"},
  Unknown:{bg:"#111",text:"#555",border:"#222"},
};
const CONF_COLOR = {High:N, Medium:"#ffb800", Low:"#ff3b3b"};

const SYSTEM_PROMPT = `You are an expert automotive parts identification specialist with 35 years of experience at salvage yards and OEM dealerships.

CRITICAL RULES:
- Identify EVERY individual part visible in the image separately
- Each part MUST be identified independently — do NOT assume parts came from the same vehicle
- Use part numbers, casting marks, shape, connectors, and design cues independently for each part

Respond ONLY with a valid JSON array — no markdown, no code blocks.

Each object:
{
  "part_name": "Full descriptive name",
  "part_category": "Engine|Transmission|Brakes|Suspension|Steering|Electrical|Body|Interior|Cooling|Fuel|Exhaust|HVAC|Drivetrain",
  "part_number_visible": "visible part number or null",
  "primary_vehicle": {
    "year_range": "e.g. 2005-2010",
    "make": "e.g. Toyota",
    "model": "e.g. Camry",
    "trim": "e.g. LE or All Trims",
    "engine": "e.g. 2.4L 4-Cyl or All Engines"
  },
  "also_fits": [{"year_range":"...","make":"...","model":"...","trim":"...","engine":"..."}],
  "condition": "Good|Fair|Worn|Damaged|Unknown",
  "condition_notes": "brief condition description",
  "identification_confidence": "High|Medium|Low",
  "identification_reasoning": "what features led to this identification",
  "notes": "extra info for salvage yard staff"
}
Always return an array.`;

const Logo = () => (
  <svg width="44" height="44" viewBox="0 0 80 80" fill="none">
    <rect width="80" height="80" rx="12" fill="#000"/>
    <rect x="2" y="2" width="76" height="76" rx="11" fill="none" stroke={N} strokeWidth="2"/>
    <text x="40" y="26" textAnchor="middle" fill={N} fontSize="11" fontWeight="900" fontFamily="monospace" letterSpacing="2">B.Y.O.T.</text>
    <text x="40" y="40" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="sans-serif">AUTO PARTS</text>
    <line x1="14" y1="46" x2="66" y2="46" stroke={N} strokeWidth="1" opacity="0.3"/>
    <text x="40" y="57" textAnchor="middle" fill={N} fontSize="5.5" fontWeight="600" fontFamily="monospace" letterSpacing="1">AI SCANNER</text>
  </svg>
);

export default function AutoScan() {
  const [tab, setTab] = useState("scan");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [imageFile, setImageFile] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedPart, setSelectedPart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("byot_hist")||"[]"); } catch { return []; }});
  const [priceSearch, setPriceSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("waco");
  const [feedback, setFeedback] = useState(null);
  const [correction, setCorrection] = useState({part_name:"",vehicle:"",notes:""});
  const [correctionSaved, setCorrectionSaved] = useState(false);
  const [learningCount, setLearningCount] = useState(0);
  const [visionUsed, setVisionUsed] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [motionStatus, setMotionStatus] = useState("idle");
  const [countdown, setCountdown] = useState(0);

  const fileRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef(null);
  const motionIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const prevPixelsRef = useRef(null);
  const autoScanEnabledRef = useRef(false);
  const scanningRef = useRef(false);

  const addHistory = entry => {
    setHistory(prev => {
      const next = [entry,...prev].slice(0,100);
      try { localStorage.setItem("byot_hist",JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const getCorrections = () => {
    try {
      const data = JSON.parse(localStorage.getItem("byot_corrections")||"[]");
      setLearningCount(data.length);
      if (!data.length) return "";
      return `\n\n=============================\nMANDATORY STAFF CORRECTIONS:\n${data.map(r=>`- ${r.text}`).join("\n")}\n=============================`;
    } catch { return ""; }
  };

  const saveCorrection = corr => {
    try {
      const ex = JSON.parse(localStorage.getItem("byot_corrections")||"[]");
      ex.unshift({text:corr, saved_at:new Date().toISOString()});
      localStorage.setItem("byot_corrections", JSON.stringify(ex.slice(0,100)));
      setLearningCount(ex.length);
    } catch {}
  };

  const compressImage = dataUrl => new Promise(res => {
    const img = new window.Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const MAX=1280; let {width:w,height:h}=img;
      if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
      c.width=w; c.height=h; c.getContext("2d").drawImage(img,0,0,w,h);
      res(c.toDataURL("image/jpeg",0.85));
    };
    img.src=dataUrl;
  });

  const processFile = file => {
    if (!file||!file.type.startsWith("image/")) return;
    setResults([]); setSelectedPart(0); setError(null); setImageFile(file); setImageMime("image/jpeg");
    setFeedback(null); setCorrection({part_name:"",vehicle:"",notes:""}); setCorrectionSaved(false); setVisionUsed(false);
    const r = new FileReader();
    r.onload = async e => { const comp = await compressImage(e.target.result); setImage(comp); setImageBase64(comp.split(",")[1]); };
    r.readAsDataURL(file);
  };

  const onDrop = useCallback(e => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); }, []);

  const googleVision = async b64 => {
    if (!VISION_KEY) return "";
    try {
      const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({requests:[{image:{content:b64},features:[
          {type:"WEB_DETECTION",maxResults:10},
          {type:"LABEL_DETECTION",maxResults:15},
          {type:"OBJECT_LOCALIZATION",maxResults:10}
        ]}]})
      });
      const data = await res.json();
      if (data.error) return "";
      const web = data.responses?.[0]?.webDetection;
      const labels = data.responses?.[0]?.labelAnnotations?.map(l=>l.description).join(", ")||"";
      const objects = data.responses?.[0]?.localizedObjectAnnotations?.map(o=>o.name).join(", ")||"";
      const entities = web?.webEntities?.map(e=>e.description).filter(Boolean).join(", ")||"";
      const bestGuess = web?.bestGuessLabels?.map(l=>l.label).join(", ")||"";
      return [bestGuess&&`Best visual match: ${bestGuess}`, entities&&`Web entities: ${entities}`, labels&&`Labels: ${labels}`, objects&&`Objects: ${objects}`].filter(Boolean).join("\n");
    } catch { return ""; }
  };

  const doScan = async (b64, mime) => {
    if (!b64 || !ANTHROPIC_KEY || scanningRef.current) return;
    scanningRef.current = true;
    setLoading(true); setError(null); setResults([]); setSelectedPart(0);
    setFeedback(null); setCorrection({part_name:"",vehicle:"",notes:""}); setCorrectionSaved(false); setVisionUsed(false);
    try {
      const learned = getCorrections();
      const visionData = await googleVision(b64);
      if (visionData) setVisionUsed(true);
      const visionCtx = visionData ? `\n\n=============================\nGOOGLE VISION DATA — use to improve vehicle ID:\n${visionData}\n=============================` : "";

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: SYSTEM_PROMPT + learned + visionCtx,
          messages: [{role:"user", content:[
            {type:"image", source:{type:"base64", media_type:mime, data:b64}},
            {type:"text", text:"Identify ALL parts independently. Each may be from a different vehicle. Apply staff corrections and Google Vision data. Return JSON array only."}
          ]}]
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      let raw = data.content[0].text.trim();
      if (raw.startsWith("```")) raw = raw.split("\n").slice(1).join("\n");
      if (raw.endsWith("```")) raw = raw.split("\n").slice(0,-1).join("\n");
      let parsed = JSON.parse(raw.trim());
      if (!Array.isArray(parsed)) parsed = [parsed];
      setResults(parsed);
      parsed.forEach(p => addHistory({...p, scanned_at:new Date().toISOString(), image_thumb:image}));
    } catch(e) { setError(e.message || "Scan failed. Check your API key."); }
    finally { setLoading(false); scanningRef.current = false; }
  };

  const scan = () => doScan(imageBase64, imageMime);

  const startCamera = async () => {
    setCameraError(null); setCaptured(false); setResults([]); setError(null); setImage(null); setImageBase64(null);
    try {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t=>t.stop()); streamRef.current=null; }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width:{ideal:1280}, height:{ideal:720} } });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play().catch(()=>{});
        }
      }, 100);
    } catch(e) { setCameraError(`Camera error: ${e.message}`); }
  };

  const stopCamera = () => {
    stopMotionDetection();
    if (streamRef.current) { streamRef.current.getTracks().forEach(t=>t.stop()); streamRef.current=null; }
    setCameraActive(false); setCaptured(false); setAutoScan(false);
    autoScanEnabledRef.current = false; setMotionStatus("idle"); setCountdown(0);
  };

  const captureAndScan = async () => {
    const v=videoRef.current, c=canvasRef.current;
    if (!v||!c) return;
    c.width=v.videoWidth; c.height=v.videoHeight;
    c.getContext("2d").drawImage(v,0,0);
    const dataUrl = c.toDataURL("image/jpeg",0.92);
    setImage(dataUrl); setImageBase64(dataUrl.split(",")[1]);
    setImageMime("image/jpeg"); setImageFile(null); setCaptured(true);
    await doScan(dataUrl.split(",")[1], "image/jpeg");
  };

  const stopMotionDetection = () => {
    if (motionIntervalRef.current) { clearInterval(motionIntervalRef.current); motionIntervalRef.current=null; }
    if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current=null; }
    prevPixelsRef.current = null;
  };

  const startMotionDetection = () => {
    stopMotionDetection();
    setMotionStatus("watching");
    let stillCount=0, countingDown=false;
    motionIntervalRef.current = setInterval(() => {
      if (!autoScanEnabledRef.current || scanningRef.current) return;
      const v = videoRef.current;
      if (!v || v.readyState < 2) return;
      const w=120, h=68, tmp=document.createElement("canvas");
      tmp.width=w; tmp.height=h; tmp.getContext("2d").drawImage(v,0,0,w,h);
      const px = tmp.getContext("2d").getImageData(0,0,w,h).data;
      if (prevPixelsRef.current) {
        let diff=0;
        for (let i=0; i<px.length; i+=4) {
          if (Math.abs(px[i]-prevPixelsRef.current[i])+Math.abs(px[i+1]-prevPixelsRef.current[i+1])+Math.abs(px[i+2]-prevPixelsRef.current[i+2]) > 35) diff++;
        }
        if (diff/(w*h) > 0.015) {
          stillCount=0; countingDown=false;
          if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current=null; }
          setMotionStatus("watching"); setCountdown(0);
        } else {
          stillCount++;
          if (stillCount>=5 && !countingDown && !scanningRef.current) {
            countingDown=true; let cd=3; setCountdown(cd); setMotionStatus("still");
            countdownIntervalRef.current = setInterval(() => {
              cd--; setCountdown(cd);
              if (cd<=0) {
                clearInterval(countdownIntervalRef.current); countdownIntervalRef.current=null;
                countingDown=false; stillCount=0; setMotionStatus("scanning"); setCountdown(0);
                captureAndScan().then(() => { if (autoScanEnabledRef.current) setMotionStatus("watching"); });
              }
            }, 1000);
          }
        }
      }
      prevPixelsRef.current = new Uint8ClampedArray(px);
    }, 200);
  };

  const toggleAutoScan = () => {
    if (autoScan) { autoScanEnabledRef.current=false; setAutoScan(false); stopMotionDetection(); setMotionStatus("idle"); setCountdown(0); }
    else { autoScanEnabledRef.current=true; setAutoScan(true); startMotionDetection(); }
  };

  useEffect(() => () => stopCamera(), []);

  const result = results[selectedPart] || null;
  const cs = result ? (COND[result.condition] || COND.Unknown) : null;
  const partPrices = result ? findPrice(result.part_name) : null;
  const filteredPrices = Object.entries(PRICES).filter(([n]) => n.toLowerCase().includes(priceSearch.toLowerCase()));
  const NAV = [{key:"scan",icon:"⬡",label:"SCAN"},{key:"camera",icon:"◉",label:"CAMERA"},{key:"prices",icon:"$",label:"PRICES"},{key:"history",icon:"≡",label:"HISTORY"}];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.white,fontFamily:"'Courier New',monospace"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#000}
        ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:4px}
        .hrow:hover{background:#161616!important}
        input,textarea{background:#0d0d0d!important;border:1px solid #222!important;color:#fff!important;font-family:monospace!important;border-radius:8px!important;padding:9px 12px!important;outline:none!important;width:100%;}
        input:focus,textarea:focus{border-color:#39ff14!important;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes scanline{0%{top:-2px}100%{top:102%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .25s ease both}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#000",borderBottom:`2px solid ${N}`}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",height:64,gap:14}}>
          <Logo/>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:C.white,letterSpacing:1}}>BYOT AUTO PARTS</div>
            <div style={{fontSize:8,color:N,letterSpacing:3,marginTop:2}}>AI PARTS SCANNER</div>
            <div style={{fontSize:7,color:C.textFaint,letterSpacing:1,marginTop:1}}>TX · LA · MS</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,background:"#0a1a0a",borderRadius:20,padding:"6px 14px",border:`1px solid ${C.neonBorder}`}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:N,animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:10,color:N,fontWeight:700,letterSpacing:1}}>CONNECTED</span>
              {learningCount>0 && <span style={{background:"#0a1a0a",border:`1px solid ${C.neonBorder}`,borderRadius:8,padding:"1px 7px",fontSize:8,color:N,fontWeight:700,marginLeft:4}}>🧠 {learningCount}</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"16px 20px"}}>
        {/* NAV */}
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {NAV.map(n=>(
            <button key={n.key} onClick={()=>{if(n.key!=="camera")stopCamera();setTab(n.key);if(n.key==="camera")setTimeout(startCamera,100);}}
              style={{flex:1,background:tab===n.key?N:C.card,border:`1px solid ${tab===n.key?N:C.border}`,borderRadius:10,padding:"11px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",transition:"all .15s"}}>
              <span style={{fontSize:16,color:tab===n.key?"#000":C.textDim}}>{n.icon}</span>
              <span style={{fontSize:9,fontWeight:900,color:tab===n.key?"#000":N,letterSpacing:2}}>{n.label}</span>
            </button>
          ))}
        </div>

        {/* SCAN TAB */}
        {tab==="scan" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
            <div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden"}}>
              <div style={{background:"#000",padding:"11px 16px",borderBottom:`1px solid ${N}`,display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:N}}>◈</span>
                <span style={{fontSize:11,fontWeight:900,color:N,letterSpacing:2}}>UPLOAD PART IMAGE</span>
              </div>
              <div onClick={()=>fileRef.current?.click()}
                onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={onDrop}
                style={{border:`2px dashed ${dragging?N:C.borderHi}`,background:dragging?"#0a1a0a":C.surface,height:260,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",margin:12,borderRadius:12,position:"relative",transition:"all .2s"}}>
                {image ? (
                  <>
                    <img src={image} alt="part" style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:10}}/>
                    {loading && <div style={{position:"absolute",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:10}}>
                      <div style={{position:"absolute",left:0,right:0,height:2,background:N,top:0,animation:"scanline 1.5s ease-in-out infinite"}}/>
                      <svg width="44" height="44" viewBox="0 0 44 44" style={{animation:"spin 1.2s linear infinite"}}><circle cx="22" cy="22" r="18" stroke={N} strokeWidth="2" strokeDasharray="45 70" fill="none"/></svg>
                    </div>}
                  </>
                ) : (
                  <div style={{textAlign:"center",padding:24}}>
                    <div style={{fontSize:40,opacity:.1,marginBottom:10,color:N}}>⬡</div>
                    <div style={{fontSize:12,fontWeight:700,color:C.textDim,marginBottom:5,letterSpacing:1}}>DROP PART IMAGE HERE</div>
                    <div style={{fontSize:9,color:C.textFaint}}>TAP TO BROWSE · JPG PNG WEBP</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={e=>processFile(e.target.files[0])} style={{display:"none"}}/>
              <div style={{padding:"0 12px 12px",display:"flex",gap:8}}>
                {image ? (
                  <>
                    <button onClick={scan} disabled={loading}
                      style={{flex:1,background:loading?C.surface:N,color:loading?C.textDim:"#000",border:`1px solid ${loading?C.border:N}`,borderRadius:10,padding:"13px 0",fontSize:13,fontWeight:900,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:1,transition:"all .18s"}}>
                      {loading ? <><svg width="14" height="14" viewBox="0 0 16 16" style={{animation:"spin 1s linear infinite"}}><circle cx="8" cy="8" r="6" stroke={N} strokeWidth="1.5" strokeDasharray="20 18" fill="none"/></svg>SCANNING...</> : <>IDENTIFY PARTS</>}
                    </button>
                    <button onClick={()=>{setImage(null);setImageBase64(null);setImageFile(null);setResults([]);setError(null);}}
                      style={{background:C.surface,border:`1px solid ${C.border}`,color:C.textDim,borderRadius:10,padding:"13px 14px",fontSize:14,cursor:"pointer"}}>✕</button>
                  </>
                ) : (
                  <button onClick={()=>fileRef.current?.click()}
                    style={{width:"100%",background:C.surface,border:`1px solid ${N}`,color:N,borderRadius:10,padding:"12px 0",fontSize:12,fontWeight:900,cursor:"pointer",letterSpacing:1}}>BROWSE FILES</button>
                )}
              </div>
            </div>

            <div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden"}}>
              <div style={{background:"#000",padding:"11px 16px",borderBottom:`1px solid ${N}`,display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:N}}>◎</span>
                <span style={{fontSize:11,fontWeight:900,color:N,letterSpacing:2}}>PART DETAILS</span>
              </div>
              {!result&&!loading&&!error&&(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,gap:10,padding:24}}>
                  <div style={{fontSize:48,opacity:.05,color:N}}>⬡</div>
                  <div style={{fontSize:11,color:C.textFaint,textAlign:"center",lineHeight:1.8,letterSpacing:1}}>UPLOAD IMAGE · PRESS IDENTIFY</div>
                </div>
              )}
              {loading&&(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,gap:14}}>
                  <svg width="50" height="50" viewBox="0 0 50 50" style={{animation:"spin 1.2s linear infinite"}}><circle cx="25" cy="25" r="20" stroke={N} strokeWidth="2" strokeDasharray="50 80" fill="none"/></svg>
                  <div style={{fontSize:12,fontWeight:700,color:N,animation:"pulse 1.8s infinite",letterSpacing:2}}>ANALYZING...</div>
                  {visionUsed&&<div style={{fontSize:9,color:C.blue,letterSpacing:1}}>GOOGLE VISION ACTIVE</div>}
                </div>
              )}
              {error&&(
                <div className="fu" style={{padding:14}}>
                  <div style={{background:C.redDim,border:`1px solid ${C.redBorder}`,borderRadius:10,padding:14}}>
                    <div style={{fontSize:12,fontWeight:900,color:C.red,marginBottom:6,letterSpacing:1}}>⚠ SCAN ERROR</div>
                    <div style={{fontSize:11,color:C.textDim,lineHeight:1.7}}>{error}</div>
                  </div>
                </div>
              )}
              {result&&(
                <div className="fu" style={{maxHeight:600,overflowY:"auto"}}>
                  {results.length>1&&(
                    <div style={{padding:"10px 12px 0",borderBottom:`1px solid ${C.border}`}}>
                      <div style={{fontSize:8,color:N,fontWeight:700,letterSpacing:2,marginBottom:6}}>{results.length} PARTS FOUND:</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",paddingBottom:8}}>
                        {results.map((p,i)=>(
                          <button key={i} onClick={()=>{setSelectedPart(i);setFeedback(null);setCorrection({part_name:"",vehicle:"",notes:""});setCorrectionSaved(false);}}
                            style={{background:selectedPart===i?N:C.surface,color:selectedPart===i?"#000":C.textDim,border:`1px solid ${selectedPart===i?N:C.border}`,borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer",letterSpacing:.5}}>
                            {i+1}. {p.part_name?.split(" ").slice(0,3).join(" ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{background:"#000",padding:"14px 16px",borderBottom:`1px solid ${C.neonBorder}`,borderLeft:`4px solid ${N}`}}>
                    <div style={{fontSize:16,fontWeight:900,color:N,lineHeight:1.2}}>{result.part_name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:8,color:C.textDim,letterSpacing:2}}>{result.part_category?.toUpperCase()}</span>
                      {visionUsed&&<span style={{background:C.blueDim,border:`1px solid ${C.blueBorder}`,color:C.blue,borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:700}}>GOOGLE VISION</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,padding:"10px 12px",borderBottom:`1px solid ${C.border}`}}>
                    {[[cs?.text||"#555","CONDITION",result.condition,cs?.bg,cs?.border],[CONF_COLOR[result.identification_confidence]||C.textDim,"CONFIDENCE",result.identification_confidence,"#0a0a0a",C.border]].map(([tc,lbl,val,bg,bc])=>(
                      <div key={lbl} style={{flex:1,background:bg,border:`1px solid ${bc}`,borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontSize:7,color:C.textDim,letterSpacing:2,marginBottom:3}}>{lbl}</div>
                        <div style={{fontSize:13,color:tc,fontWeight:900}}>{val||"—"}</div>
                      </div>
                    ))}
                  </div>
                  {result.primary_vehicle&&(
                    <div style={{margin:"10px 12px",background:"#000",border:`2px solid ${N}`,borderRadius:12,padding:"12px 14px"}}>
                      <div style={{fontSize:8,color:N,fontWeight:700,letterSpacing:2,marginBottom:6}}>PRIMARY VEHICLE</div>
                      <div style={{fontSize:16,fontWeight:900,color:N,marginBottom:4}}>{result.primary_vehicle.year_range} {result.primary_vehicle.make} {result.primary_vehicle.model}</div>
                      <div style={{fontSize:10,color:C.textMid,lineHeight:1.6}}>
                        {result.primary_vehicle.trim&&result.primary_vehicle.trim!=="All Trims"&&<span>Trim: {result.primary_vehicle.trim} · </span>}
                        {result.primary_vehicle.engine&&<span>Engine: {result.primary_vehicle.engine}</span>}
                      </div>
                    </div>
                  )}
                  {result.also_fits?.length>0&&(
                    <div style={{margin:"0 12px 10px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px"}}>
                      <div style={{fontSize:8,color:C.textDim,fontWeight:700,letterSpacing:2,marginBottom:6}}>ALSO FITS</div>
                      {result.also_fits.slice(0,4).map((v,i)=>(
                        <div key={i} style={{fontSize:10,color:C.textMid,background:"#0a0a0a",borderRadius:6,padding:"5px 10px",marginBottom:4,borderLeft:`2px solid ${C.border}`}}>
                          {v.year_range} {v.make} {v.model}{v.trim&&v.trim!=="All Trims"?` · ${v.trim}`:""}{v.engine&&v.engine!=="All Engines"?` · ${v.engine}`:""}
                        </div>
                      ))}
                    </div>
                  )}
                  {[["#","Part Number",result.part_number_visible],["~","Condition Notes",result.condition_notes],["?","How Identified",result.identification_reasoning]].filter(([,,v])=>v).map(([icon,lbl,val])=>(
                    <div key={lbl} style={{padding:"8px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8}}>
                      <span style={{color:N,fontSize:11,marginTop:1}}>{icon}</span>
                      <div>
                        <div style={{fontSize:8,color:C.textDim,fontWeight:700,letterSpacing:1.5,marginBottom:2}}>{lbl.toUpperCase()}</div>
                        <div style={{fontSize:11,color:C.textMid,lineHeight:1.6}}>{val}</div>
                      </div>
                    </div>
                  ))}
                  {result.notes&&(
                    <div style={{margin:"10px 12px",background:"#0a1a0a",borderRadius:10,padding:"10px 12px",border:`1px solid ${C.neonBorder}`}}>
                      <div style={{fontSize:8,color:N,fontWeight:700,letterSpacing:2,marginBottom:5}}>STAFF NOTES</div>
                      <div style={{fontSize:11,color:C.textDim,lineHeight:1.7}}>{result.notes}</div>
                    </div>
                  )}
                  <div style={{margin:"0 12px 10px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px"}}>
                    <div style={{fontSize:8,color:N,fontWeight:700,letterSpacing:2,marginBottom:10}}>WAS THIS CORRECT?</div>
                    {!feedback ? (
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>setFeedback("correct")} style={{flex:1,background:"#051205",border:`1px solid ${C.neonBorder}`,color:N,borderRadius:8,padding:"8px 0",fontSize:11,fontWeight:900,cursor:"pointer",letterSpacing:1}}>YES</button>
                        <button onClick={()=>setFeedback("wrong")} style={{flex:1,background:C.redDim,border:`1px solid ${C.redBorder}`,color:C.red,borderRadius:8,padding:"8px 0",fontSize:11,fontWeight:900,cursor:"pointer",letterSpacing:1}}>NO — FIX IT</button>
                      </div>
                    ) : feedback==="correct" ? (
                      <div style={{fontSize:11,color:N,fontWeight:700,letterSpacing:1}}>✓ MARKED CORRECT</div>
                    ) : (
                      <div>
                        <div style={{fontSize:9,color:C.textDim,marginBottom:10,lineHeight:1.6}}>Enter correct info below. This trains the AI for future scans.</div>
                        {correctionSaved ? (
                          <div style={{background:"#051205",border:`1px solid ${C.neonBorder}`,borderRadius:8,padding:"10px",fontSize:11,color:N,fontWeight:700,letterSpacing:1}}>✓ SAVED — AI WILL LEARN FROM THIS</div>
                        ) : (
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            <div>
                              <div style={{fontSize:8,color:C.textDim,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>CORRECT PART NAME</div>
                              <input value={correction.part_name} onChange={e=>setCorrection(p=>({...p,part_name:e.target.value}))} placeholder={`Was: ${result?.part_name}`}/>
                            </div>
                            <div>
                              <div style={{fontSize:8,color:C.textDim,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>CORRECT VEHICLE</div>
                              <input value={correction.vehicle} onChange={e=>setCorrection(p=>({...p,vehicle:e.target.value}))} placeholder="e.g. 2007 Toyota Camry LE 2.4L"/>
                            </div>
                            <div>
                              <div style={{fontSize:8,color:C.textDim,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>NOTES (optional)</div>
                              <textarea value={correction.notes} onChange={e=>setCorrection(p=>({...p,notes:e.target.value}))} placeholder="Extra info..." rows={2} style={{resize:"vertical",lineHeight:1.5}}/>
                            </div>
                            <button onClick={()=>{
                              const parts=[correction.part_name&&`Correct part: ${correction.part_name}`,correction.vehicle&&`Correct vehicle: ${correction.vehicle}`,correction.notes&&`Notes: ${correction.notes}`].filter(Boolean).join(" | ");
                              if (!parts.trim()) return;
                              const full=`AI said "${result?.part_name}" from "${result?.primary_vehicle?.year_range||""} ${result?.primary_vehicle?.make||""} ${result?.primary_vehicle?.model||""}". Staff correction: ${parts}`;
                              setCorrectionSaved(true); saveCorrection(full);
                            }} style={{background:N,color:"#000",border:"none",borderRadius:8,padding:"10px 0",fontSize:12,fontWeight:900,cursor:"pointer",letterSpacing:1}}>
                              SAVE & TRAIN AI
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{margin:"0 12px 14px",background:"#000",border:`2px solid ${N}`,borderRadius:12,overflow:"hidden"}}>
                    <div style={{background:"#000",padding:"10px 14px",borderBottom:`1px solid ${C.neonBorder}`,display:"flex",alignItems:"center",gap:7}}>
                      <span style={{color:N}}>$</span>
                      <span style={{fontSize:10,fontWeight:900,color:N,letterSpacing:2}}>BYOT PRICING — ALL LOCATIONS</span>
                    </div>
                    {partPrices ? (
                      <div style={{padding:10}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                          {LOCATIONS.map(loc=>{
                            const price=partPrices[loc.key];
                            return (
                              <div key={loc.key} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                <div style={{fontSize:9,color:C.textDim}}>{loc.label}</div>
                                <div style={{fontSize:14,fontWeight:900,color:price?N:C.textFaint}}>{price?`$${price.toFixed(2)}`:"—"}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{fontSize:8,color:C.textFaint,textAlign:"center",marginTop:8,letterSpacing:1}}>PULL-IT-YOURSELF RATES</div>
                      </div>
                    ) : (
                      <div style={{padding:14,textAlign:"center",fontSize:10,color:C.textDim}}>
                        NOT IN PRICE LIST. <span style={{color:N,cursor:"pointer"}} onClick={()=>setTab("prices")}>SEARCH PRICE LIST →</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAMERA TAB */}
        {tab==="camera" && (
          <div className="fu" style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{background:"#000",padding:"11px 16px",borderBottom:`1px solid ${N}`,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:N}}>◉</span>
              <span style={{fontSize:11,fontWeight:900,color:N,letterSpacing:2}}>LIVE CAMERA FEED</span>
            </div>
            <div style={{padding:14}}>
              <canvas ref={canvasRef} style={{display:"none"}}/>
              {cameraError&&<div style={{background:C.redDim,border:`1px solid ${C.redBorder}`,borderRadius:10,padding:12,marginBottom:12,fontSize:11,color:C.red}}>⚠ {cameraError}</div>}
              <div style={{position:"relative",background:"#000",borderRadius:14,overflow:"hidden",aspectRatio:"16/9",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`}}>
                <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover",display:cameraActive&&!captured?"block":"none"}}/>
                {captured&&image&&<img src={image} alt="captured" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>}
                {!cameraActive&&!captured&&(
                  <div style={{textAlign:"center",padding:40}}>
                    <div style={{fontSize:56,opacity:.05,marginBottom:12,color:N}}>◉</div>
                    <div style={{fontSize:12,fontWeight:700,color:C.textFaint,letterSpacing:2}}>CAMERA OFFLINE</div>
                    <div style={{fontSize:9,color:C.textFaint,marginTop:6}}>PRESS START LIVE FEED BELOW</div>
                  </div>
                )}
                {cameraActive&&!loading&&(
                  <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
                    {[["top:14px","left:14px","borderTop","borderLeft"],["top:14px","right:14px","borderTop","borderRight"],["bottom:14px","left:14px","borderBottom","borderLeft"],["bottom:14px","right:14px","borderBottom","borderRight"]].map(([t,s,b1,b2],i)=>(
                      <div key={i} style={{position:"absolute",[t.split(":")[0]]:t.split(":")[1],[s.split(":")[0]]:s.split(":")[1],width:32,height:32,[b1]:`2px solid ${N}`,[b2]:`2px solid ${N}`}}/>
                    ))}
                    <div style={{position:"absolute",bottom:10,left:0,right:0,textAlign:"center",fontSize:8,color:N,letterSpacing:3}}>AIM AT PART</div>
                  </div>
                )}
                {cameraActive&&autoScan&&(
                  <div style={{position:"absolute",top:12,left:12,right:12,display:"flex",alignItems:"center",justifyContent:"space-between",pointerEvents:"none"}}>
                    <div style={{background:"#000000dd",borderRadius:20,padding:"5px 12px",display:"flex",alignItems:"center",gap:7,border:`1px solid ${C.border}`}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:motionStatus==="still"?C.amber:N,animation:"pulse 1.2s infinite"}}/>
                      <span style={{fontSize:9,fontWeight:700,color:"#fff",letterSpacing:1}}>
                        {motionStatus==="watching"&&"WATCHING..."}
                        {motionStatus==="still"&&`SCANNING IN ${countdown}S`}
                        {motionStatus==="scanning"&&"SCANNING..."}
                      </span>
                    </div>
                    {motionStatus==="still"&&<div style={{background:N,borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#000",animation:"pulse 0.8s infinite"}}>{countdown}</div>}
                  </div>
                )}
                {loading&&(
                  <div style={{position:"absolute",inset:0,background:"#000000cc",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
                    <div style={{position:"absolute",left:0,right:0,height:2,background:N,top:0,animation:"scanline 1.5s ease-in-out infinite"}}/>
                    <svg width="50" height="50" viewBox="0 0 50 50" style={{animation:"spin 1.2s linear infinite"}}><circle cx="25" cy="25" r="20" stroke={N} strokeWidth="2" strokeDasharray="50 80" fill="none"/></svg>
                    <div style={{fontSize:12,fontWeight:900,color:N,animation:"pulse 1.5s infinite",letterSpacing:2}}>SCANNING...</div>
                  </div>
                )}
              </div>
              {cameraActive&&(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:autoScan?"#0a1a0a":C.surface,border:`1px solid ${autoScan?N:C.border}`,borderRadius:10,padding:"10px 14px",marginTop:10,transition:"all .2s"}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:900,color:autoScan?N:C.textMid,letterSpacing:1}}>AUTO-SCAN MODE</div>
                    <div style={{fontSize:9,color:C.textFaint,marginTop:2}}>SET PART DOWN → HOLD STILL → SCANS AUTOMATICALLY</div>
                  </div>
                  <button onClick={toggleAutoScan} style={{background:autoScan?N:C.card,border:`1px solid ${autoScan?N:C.border}`,borderRadius:20,padding:"7px 18px",fontSize:11,fontWeight:900,color:autoScan?"#000":C.textDim,cursor:"pointer",transition:"all .2s",minWidth:60,letterSpacing:1}}>
                    {autoScan?"ON":"OFF"}
                  </button>
                </div>
              )}
              <div style={{display:"flex",gap:8,marginTop:10}}>
                {!cameraActive&&!captured&&<button onClick={startCamera} style={{flex:1,background:N,color:"#000",border:"none",borderRadius:10,padding:"13px 0",fontSize:13,fontWeight:900,cursor:"pointer",letterSpacing:2}}>START LIVE FEED</button>}
                {cameraActive&&!autoScan&&(
                  <>
                    <button onClick={captureAndScan} disabled={loading} style={{flex:2,background:loading?C.surface:N,color:loading?C.textDim:"#000",border:`1px solid ${loading?C.border:N}`,borderRadius:10,padding:"13px 0",fontSize:13,fontWeight:900,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:1}}>
                      {loading?<><svg width="14" height="14" viewBox="0 0 16 16" style={{animation:"spin 1s linear infinite"}}><circle cx="8" cy="8" r="6" stroke={N} strokeWidth="1.5" strokeDasharray="20 18" fill="none"/></svg>SCANNING...</>:<>CAPTURE & SCAN</>}
                    </button>
                    <button onClick={stopCamera} style={{flex:1,background:C.surface,border:`1px solid ${C.redBorder}`,color:C.red,borderRadius:10,padding:"13px 0",fontSize:11,fontWeight:900,cursor:"pointer",letterSpacing:1}}>STOP</button>
                  </>
                )}
                {cameraActive&&autoScan&&<button onClick={stopCamera} style={{flex:1,background:C.surface,border:`1px solid ${C.redBorder}`,color:C.red,borderRadius:10,padding:"13px 0",fontSize:11,fontWeight:900,cursor:"pointer",letterSpacing:1}}>STOP CAMERA</button>}
                {captured&&!cameraActive&&(
                  <>
                    <button onClick={()=>{setImage(null);setImageBase64(null);setCaptured(false);setResults([]);setError(null);startCamera();}} style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,color:N,borderRadius:10,padding:"13px 0",fontSize:11,fontWeight:900,cursor:"pointer",letterSpacing:1}}>SCAN ANOTHER</button>
                    <button onClick={()=>setTab("scan")} style={{flex:1,background:N,color:"#000",border:"none",borderRadius:10,padding:"13px 0",fontSize:11,fontWeight:900,cursor:"pointer",letterSpacing:1}}>VIEW RESULTS →</button>
                  </>
                )}
              </div>
              {results.length>0&&(
                <div className="fu" style={{marginTop:14,background:C.surface,borderRadius:12,border:`1px solid ${N}`,overflow:"hidden"}}>
                  <div style={{background:"#000",padding:"10px 14px",borderBottom:`1px solid ${C.neonBorder}`}}>
                    <span style={{fontSize:10,fontWeight:900,color:N,letterSpacing:2}}>{results.length} PART{results.length>1?"S":""} IDENTIFIED</span>
                  </div>
                  <div style={{padding:10,display:"flex",flexDirection:"column",gap:8}}>
                    {results.map((r,i)=>{
                      const pv=r.primary_vehicle, pp=findPrice(r.part_name);
                      return (
                        <div key={i} style={{background:C.card,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`,borderLeft:`3px solid ${N}`}}>
                          <div style={{fontSize:13,fontWeight:900,color:N,marginBottom:3}}>{r.part_name}</div>
                          {pv&&<div style={{fontSize:10,color:C.textMid,marginBottom:3}}>{pv.year_range} {pv.make} {pv.model}</div>}
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
                            <span style={{fontSize:9,color:CONF_COLOR[r.identification_confidence]||C.textDim,fontWeight:700}}>{r.identification_confidence}</span>
                            {pp?.waco&&<span style={{fontSize:13,fontWeight:900,color:N}}>WACO: ${pp.waco.toFixed(2)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{padding:"0 10px 10px"}}>
                    <button onClick={()=>setTab("scan")} style={{width:"100%",background:N,color:"#000",border:"none",borderRadius:8,padding:"10px 0",fontSize:12,fontWeight:900,cursor:"pointer",letterSpacing:1}}>FULL DETAILS & ALL PRICES →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRICE LIST TAB */}
        {tab==="prices" && (
          <div className="fu" style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{background:"#000",padding:"11px 16px",borderBottom:`1px solid ${N}`,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:N}}>$</span>
              <span style={{fontSize:11,fontWeight:900,color:N,letterSpacing:2}}>BYOT PARTS PRICE LIST</span>
            </div>
            <div style={{padding:14}}>
              <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                {LOCATIONS.map(loc=>(
                  <button key={loc.key} onClick={()=>setSelectedLocation(loc.key)}
                    style={{background:selectedLocation===loc.key?N:C.surface,color:selectedLocation===loc.key?"#000":C.textDim,border:`1px solid ${selectedLocation===loc.key?N:C.border}`,borderRadius:8,padding:"6px 14px",fontSize:10,fontWeight:900,cursor:"pointer",transition:"all .15s",letterSpacing:.5}}>
                    {loc.label}
                  </button>
                ))}
              </div>
              <input placeholder="SEARCH PARTS..." value={priceSearch} onChange={e=>setPriceSearch(e.target.value)} style={{marginBottom:10,fontSize:12,letterSpacing:1}}/>
              <div style={{maxHeight:500,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${N}`}}>
                      <th style={{textAlign:"left",padding:"8px 10px",fontSize:9,color:N,fontWeight:900,letterSpacing:2}}>PART NAME</th>
                      <th style={{textAlign:"right",padding:"8px 10px",fontSize:9,color:N,fontWeight:900,letterSpacing:2}}>PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrices.map(([name,prices])=>{
                      const price=prices[selectedLocation];
                      if (!price) return null;
                      return (
                        <tr key={name} className="hrow" style={{borderBottom:`1px solid ${C.border}`,transition:"background .1s"}}>
                          <td style={{padding:"8px 10px",fontSize:11,color:C.textMid}}>{name}</td>
                          <td style={{padding:"8px 10px",fontSize:13,color:N,fontWeight:900,textAlign:"right"}}>${price.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredPrices.filter(([,p])=>p[selectedLocation]).length===0&&(
                  <div style={{textAlign:"center",padding:32,color:C.textFaint,fontSize:11,letterSpacing:1}}>NO PARTS FOUND FOR "{priceSearch}"</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab==="history" && (
          <div className="fu" style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{background:"#000",padding:"11px 18px",borderBottom:`1px solid ${N}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:N}}>≡</span>
                <span style={{fontSize:11,fontWeight:900,color:N,letterSpacing:2}}>SCAN HISTORY</span>
              </div>
              <div style={{background:N,color:"#000",borderRadius:20,padding:"3px 12px",fontSize:10,fontWeight:900,letterSpacing:1}}>{history.length} SCANS</div>
            </div>
            {history.length===0 ? (
              <div style={{padding:48,textAlign:"center"}}>
                <div style={{fontSize:36,opacity:.05,marginBottom:10,color:N}}>≡</div>
                <div style={{fontSize:12,fontWeight:700,color:C.textFaint,letterSpacing:2}}>NO SCANS YET</div>
              </div>
            ) : (
              <div style={{padding:12,display:"flex",flexDirection:"column",gap:8,maxHeight:600,overflowY:"auto"}}>
                {history.map((h,i)=>{
                  const c=COND[h.condition]||COND.Unknown, pv=h.primary_vehicle;
                  return (
                    <div key={i} className="hrow" style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:h.image_thumb?"70px 1fr auto":"1fr auto",overflow:"hidden",borderLeft:`3px solid ${C.border}`,transition:"background .12s"}}>
                      {h.image_thumb&&<img src={h.image_thumb} alt="" style={{width:70,height:70,objectFit:"cover"}}/>}
                      <div style={{padding:"9px 12px"}}>
                        <div style={{fontSize:12,fontWeight:900,color:C.white,marginBottom:3}}>{h.part_name}</div>
                        {pv&&<div style={{fontSize:10,color:N,fontWeight:700,marginBottom:3}}>{pv.year_range} {pv.make} {pv.model}</div>}
                        <div style={{fontSize:9,color:C.textFaint}}>{new Date(h.scanned_at).toLocaleString()}</div>
                      </div>
                      <div style={{padding:"9px 12px",display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"center",gap:4}}>
                        <div style={{padding:"3px 9px",background:c.bg,border:`1px solid ${c.border}`,color:c.text,borderRadius:6,fontSize:9,fontWeight:900}}>{h.condition}</div>
                        <div style={{fontSize:9,color:CONF_COLOR[h.identification_confidence]||C.textDim,fontWeight:700}}>{h.identification_confidence}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{marginTop:16,textAlign:"center",fontSize:8,color:C.textFaint,letterSpacing:2}}>
          BYOT AUTO PARTS · AI SCANNER · WACO · BRYAN · BEAUMONT · BATON ROUGE · JACKSON
        </div>
      </div>
    </div>
  );
}
