export interface DirectionsResponse {
    routes:    Route[];
    waypoints: Waypoint[];
    code:      string;
    uuid:      string;
}

export interface Route {
    weight_name: string;
    weight:      number;
    duration:    number;
    distance:    number;
    legs:        Leg[];
    geometry:    RouteGeometry;
}

export interface RouteGeometry {
    coordinates: Array<number[]>;
    type:        GeometryType;
}

export type GeometryType = "LineString";

export interface Leg {
    via_waypoints: unknown[];
    admins:        Admin[];
    weight:        number;
    duration:      number;
    steps:         Step[];
    distance:      number;
    summary:       string;
}

export interface Admin {
    iso_3166_1_alpha3: string;
    iso_3166_1:        string;
}

export interface Step {
    intersections: Intersection[];
    maneuver:      Maneuver;
    name:          string;
    duration:      number;
    distance:      number;
    driving_side:  DrivingSide;
    weight:        number;
    mode:          Mode;
    geometry:      RouteGeometry;
}

export type DrivingSide = "left" | "right" | "straight";

export interface Intersection {
    entry:              boolean[];
    bearings:           number[];
    duration?:          number;
    mapbox_streets_v8?: MapboxStreetsV8;
    is_urban?:          boolean;
    admin_index:        number;
    out?:               number;
    weight?:            number;
    geometry_index:     number;
    location:           number[];
    in?:                number;
    turn_weight?:       number;
    turn_duration?:     number;
    traffic_signal?:    boolean;
    lanes?:             Lane[];
}

export interface Lane {
    indications:       DrivingSide[];
    valid_indication?: DrivingSide;
    valid:             boolean;
    active:            boolean;
}

export interface MapboxStreetsV8 {
    class: Class;
}

export type Class = "secondary" | "street" | "tertiary";

export interface Maneuver {
    type:           ManeuverType;
    instruction:    string;
    bearing_after:  number;
    bearing_before: number;
    location:       number[];
    modifier?:      Modifier;
}

export type Modifier = "left" | "right" | "slight left";

export type ManeuverType = "arrive" | "depart" | "turn";

export type Mode = "driving";

export interface Waypoint {
    distance: number;
    name:     string;
    location: number[];
}
