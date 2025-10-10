import io
import os
from datetime import datetime

import pandas as pd
import numpy as np
import pytz
import plotly.graph_objects as go

import dash_bootstrap_components as dbc
from dash import Dash, dcc, html, Input, Output, State, callback_context, no_update

# === 1. Initialize Dash App ===
app = Dash(
    __name__,
    external_stylesheets=[dbc.themes.CYBORG],
    suppress_callback_exceptions=True
)
server = app.server

# === 2. App Layout ===
sidebar = dbc.Card([
    html.H5("Controls", className="card-title"),

    # File picker
    dbc.InputGroup([
        dbc.Input(id="file-path", placeholder="Server path (.csv/.xlsx)", type="text"),
        dbc.Button("Load File", id="load-button", n_clicks=0, color="primary"),
    ], className="mb-3"),
    html.Div(id="file-info"),
    dcc.Store(id="df-store"),

    # Column selectors
    dbc.Label("X‑Axis"), dcc.Dropdown(id="x-axis", placeholder="Select X"),
    dbc.Label("Y‑Axis"), dcc.Dropdown(id="y-axis", placeholder="Select Y"),
    dbc.Label("Z‑Axis"), dcc.Dropdown(id="z-axis", placeholder="Select Z"),
    dbc.Label("Time (optional)"), dcc.Dropdown(id="time-col", options=[{"label":"None","value":"None"}], value="None"),

    # Time window selector
    dbc.Label("Time Window"),
    dcc.DatePickerRange(
        id="date-range",
        start_date_placeholder_text="Start Date",
        end_date_placeholder_text="End Date",
        display_format="YYYY-MM-DD",
        clearable=True
    ),

    # Options
    dbc.Checklist(
        id="latlon-scale",
        options=[{"label":"Apply Lat/Lon Scaling","value":"scale"}],
        value=[], inline=True, className="mb-2"),
    dbc.Checklist(
        id="dark-mode",
        options=[{"label":"Dark Mode","value":"dark"}],
        value=[], inline=True, className="mb-2"),
    dbc.Checklist(
        id="show-cloud",
        options=[{"label":"Show All Points","value":"show"}],
        value=["show"], inline=True, className="mb-2"),

    # Zoom slider
    dbc.Label("Zoom"),
    dcc.Slider(
        id="zoom-level", min=0.2, max=2, step=0.1, value=1,
        marks={0.2:"0.2×",1:"1×",2:"2×"},
        tooltip={"always_visible":True,"placement":"bottom"},
        className="mb-3"
    ),

    # Data types
    dbc.Label("X Data Type"),
    dcc.Dropdown(
        id="x-type",
        options=[{"label":t,"value":t} for t in ["Floating","Angular (deg)","Angular (rad)","Angular (gon)"]],
        value="Floating"
    ),
    dbc.Label("Y Data Type"),
    dcc.Dropdown(
        id="y-type",
        options=[{"label":t,"value":t} for t in ["Floating","Angular (deg)","Angular (rad)","Angular (gon)"]],
        value="Floating"
    ),

    # Plot options
    dbc.Label("Title"), dbc.Input(id="plot-title", value="FIGURE 1", className="mb-2"),
    dbc.Label("Mode"),
    dcc.Dropdown(
        id="plot-mode",
        options=[{"label":m,"value":m} for m in ["3D Scatter","3D Contour","3D Surface","3D Wireframe","3D Möbius Strip"]],
        value="3D Scatter"
    ),
    dbc.Label("Color Palette"),
    dcc.Dropdown(
        id="color-palette",
        options=[{"label":p,"value":p} for p in ["plasma","viridis","inferno","magma","cividis","jet","hot","rainbow","rdbu"]],
        value="plasma"
    ),

    # Dynamic attribute controls
dbc.Label("Color‑By"),
dcc.Dropdown(id="color-by", placeholder="Select a column to color by"),

# ✅ New dropdown for stats panel extras
dbc.Label("Extra Fields for Stats Panel"),
dcc.Dropdown(
    id="extra-stats-cols",
    multi=True,
    placeholder="Select columns"
),

    dbc.Label("Marker Size"),
    dcc.Slider(
        id="marker-size", min=1, max=20, step=1, value=4,
        marks={1:"1",10:"10",20:"20"},
        tooltip={"always_visible":True,"placement":"bottom"}
    ),
    dbc.Label("Marker Opacity"),
    dcc.Slider(
        id="marker-opacity", min=0.1, max=1, step=0.1, value=0.8,
        marks={0.1:"0.1",0.5:"0.5",1:"1"},
        tooltip={"always_visible":True,"placement":"bottom"}
    ),
    html.Hr(),
    # ─── Clustering Controls ───────────────────────────────────
    html.Hr(),
    dbc.Label("Clustering"),
    dbc.Checklist(
        id="cluster-toggle",
        options=[{"label":"Enable K‑Means Clustering","value":"on"}],
        value=[],
        inline=True,
        className="mb-2"
    ),
    dbc.Label("Number of Clusters"),
    dcc.Input(
        id="n-clusters",
        type="number",
        min=1, max=20, step=1,
        value=3,
        placeholder="e.g. 3",
        style={"width":"6rem"}
    ),
    html.Hr(),

    # Timezone & units
    dbc.Label("Timezone"),
    dcc.Dropdown(
        id="timezone",
        options=[{"label":tz,"value":tz} for tz in pytz.all_timezones],
        value="UTC"
    ),
    dbc.Label("Units"),
    dbc.RadioItems(
        id="unit-system",
        options=[{"label":"Metric (m)","value":"metric"},{"label":"Imperial (ft)","value":"imperial"}],
        value="metric", inline=True, className="mb-3"
    ),

    # Length converter
    html.Hr(), html.H6("Length Converter"),
    dbc.InputGroup([
        dbc.Input(id="conv-value", type="number", placeholder="Value", min=0),
        dcc.Dropdown(
            id="conv-from-unit",
            options=[{"label":u,"value":u} for u in ["m","cm","mm","km","in","ft","yd","mi","NM"]],
            value="m", clearable=False, style={"width":"7rem"}
        ),
        dcc.Dropdown(
            id="conv-to-unit",
            options=[{"label":u,"value":u} for u in ["m","cm","mm","km","in","ft","yd","mi","NM"]],
            value=["ft","km"], multi=True, style={"width":"8rem"}
        ),
    ], className="mb-2"),
    html.Div(id="conv-output", className="mb-3"),

    # View presets
    html.Hr(), html.H6("View Presets"),
    dbc.Button("Top View", id="btn-top", color="secondary", className="me-1"),
    dbc.Button("Side View", id="btn-side", color="secondary", className="me-1"),
    dbc.Button("Iso View", id="btn-iso", color="secondary", className="me-1"),

    # Animation controls
    html.Hr(), html.H6("Animation Controls"),
    dbc.Button("Play", id="play-button", color="success", className="me-1"),
    dbc.Button("Pause", id="pause-button", color="danger", className="me-1"),
    dbc.Label("Speed (ms/frame)"), dbc.Input(id="speed-input", type="number", min=10, value=100, step=10),
    dbc.Label("Frame"), dcc.Slider(id="frame-slider", min=0, max=0, step=1, value=0, updatemode="mouseup", tooltip={"always_visible":True,"placement":"bottom"}),
    dcc.Interval(id="interval", interval=100, n_intervals=0, disabled=True),
], body=True, style={"height":"100vh","overflow":"auto"})

content = dbc.Container([
    dcc.Graph(id="3d-plot", style={"height":"65vh"}),  # Optional: increase height
    dcc.Graph(id="histogram", style={"height":"25vh"}),
    html.Div(id="stats-panel", className="mt-2"),
], fluid=True)

app.layout = dbc.Row([
    dbc.Col(sidebar, width=3),
    dbc.Col(content, width=9),
], style={"margin":0,"padding":0})

# === 3. Load file callback ===
@app.callback(
    Output("df-store","data"),
    Output("file-info","children"),
    Input("load-button","n_clicks"),
    State("file-path","value")
)
def load_file(n, path):
    if not n or not path:
        return no_update, ""
    if not os.path.exists(path):
        return {}, dbc.Alert(f"File not found: {path}", color="danger")
    try:
        df = (pd.read_excel(path) if path.lower().endswith((".xls","xlsx"))
              else pd.read_csv(path))
    except Exception as e:
        return {}, dbc.Alert(f"Error reading file: {e}", color="danger")
    return df.to_json(date_format="iso", orient="split"), \
           dbc.Alert(f"Loaded {os.path.basename(path)} ({len(df)} rows)", color="success")

# === 4. Populate dropdowns ===
@app.callback(
    Output("x-axis","options"),
    Output("y-axis","options"),
    Output("z-axis","options"),
    Output("time-col","options"),
    Output("color-by","options"),
    Output("extra-stats-cols", "options"),
    Input("df-store","data")
)
def set_columns(json_data):
    if not json_data:
        empty = []
        return empty, empty, empty, [{"label":"None","value":"None"}], empty
    df = pd.read_json(io.StringIO(json_data), orient="split")
    opts = [{"label":c,"value":c} for c in df.columns]
    time_opts = [{"label":"None","value":"None"}] + opts
    return opts, opts, opts, time_opts, opts, opts

# === 5. Slider max ===
@app.callback(
    Output("frame-slider","max"),
    Input("df-store","data")
)
def update_slider_max(json_data):
    if not json_data:
        return 0
    df = pd.read_json(io.StringIO(json_data), orient="split")
    return max(len(df)-1, 0)

# === 6. Interval speed ===
@app.callback(
    Output("interval","interval"),
    Input("speed-input","value")
)
def update_interval_speed(ms):
    return ms if ms and ms>0 else no_update

# === 7. Play/Pause ===
@app.callback(
    Output("interval","disabled"),
    Input("play-button","n_clicks"),
    Input("pause-button","n_clicks")
)
def play_pause(play, pause):
    trig = callback_context.triggered[0]["prop_id"].split(".")[0]
    return False if trig=="play-button" else True if trig=="pause-button" else True

# === 8. Auto-advance ===
@app.callback(
    Output("frame-slider","value"),
    Input("interval","n_intervals"),
    State("frame-slider","value"),
    State("frame-slider","max")
)
def auto_advance(n, current, mx):
    return 0 if mx<=0 else (current + 1) % (mx+1)

# === 9. Draw/update plots & stats ===
@app.callback(
    Output("3d-plot", "figure"),
    Output("stats-panel", "children"),
    [
        Input("df-store", "data"),
        Input("x-axis", "value"),
        Input("y-axis", "value"),
        Input("z-axis", "value"),
        Input("time-col", "value"),
        Input("latlon-scale", "value"),
        Input("x-type", "value"),
        Input("y-type", "value"),
        Input("plot-title", "value"),
        Input("plot-mode", "value"),
        Input("color-palette", "value"),
        Input("timezone", "value"),
        Input("dark-mode", "value"),
        Input("unit-system", "value"),
        Input("show-cloud", "value"),
        Input("color-by", "value"),
        Input("cluster-toggle", "value"),
        Input("n-clusters", "value"),
        Input("date-range", "start_date"),
        Input("date-range", "end_date"),
        Input("marker-size", "value"),
        Input("marker-opacity", "value"),
        Input("frame-slider", "value"),
        Input("btn-top", "n_clicks"),
        Input("btn-side", "n_clicks"),
        Input("btn-iso", "n_clicks"),
        Input("extra-stats-cols", "value"),
    ],
    State("3d-plot", "figure")
)
def update_plots(
    json_data, xcol, ycol, zcol, tcol, latlon, xtype, ytype,
    title, mode, palette, tz, dark, unit, show_cloud_vals,
    color_by, cluster_toggle, n_clusters,
    start_date, end_date, marker_size, marker_opacity,
    idx, top, side, iso, extra_cols, old_fig
):
    # validate
    if not json_data or not all([xcol, ycol, zcol]):
        return go.Figure(), ""

    # rehydrate DataFrame
    df = pd.read_json(io.StringIO(json_data), orient="split")

    # time‑window filter
    if tcol != "None" and start_date and end_date:
        dates = pd.to_datetime(df[tcol], unit="s", errors="coerce").dt.date
        mask = dates.between(
            pd.to_datetime(start_date).date(),
            pd.to_datetime(end_date).date()
        )
        df = df.loc[mask].reset_index(drop=True)

    # extract coordinates
    x = pd.to_numeric(df[xcol], errors="coerce").values
    y = pd.to_numeric(df[ycol], errors="coerce").values
    z = -pd.to_numeric(df[zcol], errors="coerce").values

    # lat/lon scaling
    if "scale" in latlon and y.min() >= -90 and y.max() <= 90:
        x = x * np.cos(np.deg2rad(np.nanmean(y)))

    # angular conversion
    def conv(arr, typ):
        if typ == "Angular (deg)": return np.deg2rad(arr)
        if typ == "Angular (gon)": return arr * (np.pi/200)
        return arr
    x, y = conv(x, xtype), conv(y, ytype)

    # depth conversion
    depth_m = -z
    if unit == "imperial": depth_disp = depth_m * 3.28084; du = "ft"
    else: depth_disp = depth_m; du = "m"

    # clustering logic (pure numpy)
    if "on" in cluster_toggle and n_clusters and n_clusters > 1:
        pts = np.vstack((x, y, z)).T
        # mask invalid rows
        valid = ~np.isnan(pts).any(axis=1)
        labels = np.full(len(pts), np.nan)
        pts_valid = pts[valid]
        # simple k-means
        def simple_kmeans(data, k, iters=10):
            rng = np.random.RandomState(0)
            # initialize centroids
            centroids = data[rng.choice(len(data), size=k, replace=False)]
            for _ in range(iters):
                # assign clusters
                dists = np.linalg.norm(data[:, None, :] - centroids[None, :, :], axis=2)
                lbls = np.argmin(dists, axis=1)
                # update centroids
                for j in range(k):
                    if np.any(lbls == j):
                        centroids[j] = data[lbls == j].mean(axis=0)
            return lbls
        k = int(n_clusters)
        lbls_valid = simple_kmeans(pts_valid, k)
        labels[valid] = lbls_valid
        color_vals = labels
        colorbar_title = f"Cluster ID ({k})"
    else:
        # fallback to existing color logic
        if color_by and color_by in df.columns:
            color_vals = pd.to_numeric(df[color_by], errors="coerce").values
            colorbar_title = color_by
        else:
            color_vals = z
            colorbar_title = zcol

    # build traces
    traces = []
    if "show" in show_cloud_vals:
        traces.append(go.Scatter3d(
            x=x, y=y, z=z, mode="markers",
            marker=dict(
                size=marker_size,
                opacity=marker_opacity,
                color=color_vals,
                colorscale=palette,
                showscale=True,
                colorbar=dict(title=colorbar_title, len=0.5)
            ),
            name="All Points"
        ))
    traces.append(go.Scatter3d(
        x=x[:idx+1], y=y[:idx+1], z=z[:idx+1], mode="lines",
        line=dict(color=color_vals[:idx+1], colorscale=palette, width=marker_size/2),
        name="Trail"
    ))
    traces.append(go.Scatter3d(
        x=[x[idx]], y=[y[idx]], z=[z[idx]], mode="markers",
        marker=dict(size=marker_size*1.5, color="red", opacity=1.0),
        name="Current"
    ))

    # camera controls
    trig = callback_context.triggered[0]["prop_id"].split(".")[0]
    prev_cam = old_fig.get("layout", {}).get("scene", {}).get("camera") if old_fig else None
    if trig == "btn-top": cam = dict(eye=dict(x=0, y=0, z=2))
    elif trig == "btn-side": cam = dict(eye=dict(x=2, y=0, z=0))
    elif trig == "btn-iso": cam = dict(eye=dict(x=1.25, y=1.25, z=1.25))
    else: cam = prev_cam or dict(eye=dict(x=1.25, y=1.25, z=1.25))

    # assemble 3D
    fig3d = go.Figure(data=traces)
    fig3d.update_layout(
        scene=dict(
            xaxis_title=xcol, yaxis_title=ycol,
            zaxis_title=f"{zcol} ({du})", camera=cam
        ),
        title=title,
        template="plotly_dark" if dark else "plotly_white",
        legend=dict(title="Layers", orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )

    # 2D map subplot
    if "scale" in latlon and y.min() >= -90 and y.max() <= 90:
        mapfig = go.Figure(go.Scattermapbox(
            lat=y, lon=x, mode="markers+lines",
            marker=dict(size=4, color=color_vals, colorscale=palette),
            line=dict(color=color_vals, colorscale=palette, width=2)
        ))
        mapfig.update_layout(
            mapbox_style="open-street-map",
            mapbox=dict(center=dict(lat=np.mean(y), lon=np.mean(x)), zoom=3),
            margin=dict(l=0, r=0, t=0, b=0)
        )
    else:
        mapfig = go.Figure()

    # stats panel
    raw_time = df[tcol].iloc[idx] if tcol != "None" else None
    try:
        human_time = (
            datetime.fromtimestamp(raw_time, tz=pytz.UTC)
            .strftime("%Y-%m-%d %H:%M:%S.%f")
            if pd.api.types.is_numeric_dtype(df[tcol].dtype)
            else str(raw_time)
        )
    except:
        human_time = str(raw_time)

    stat_items = [
        html.Div(f"Frame: {idx}"),
        html.Div(f"{xcol}: {x[idx]:.2f}"),
        html.Div(f"{ycol}: {y[idx]:.2f}"),
        html.Div(f"Depth: {depth_disp[idx]:.1f} {du}"),
        html.Div(f"Time: {raw_time}"),
        html.Div(f"Converted: {human_time}"),
    ]

    # Add extra selected columns
    if extra_cols:
        for col in extra_cols:
            try:
                val = df[col].iloc[idx]
                stat_items.append(html.Div(f"{col}: {val}"))
            except:
                stat_items.append(html.Div(f"{col}: (unavailable)"))

    stats = dbc.Alert(stat_items, color="info")
    return fig3d, stats

# === Histogram callback ===
@app.callback(
    Output("histogram","figure"),
    [
        Input("df-store","data"),
        Input("time-col","value"),
        Input("z-axis","value"),
        Input("color-by","value"),
        Input("date-range","start_date"),
        Input("date-range","end_date"),
        Input("dark-mode","value"),
    ]
)
def update_histogram(json_data, tcol, zcol, color_by, start_date, end_date, dark):
    if not json_data:
        return go.Figure()
    df=pd.read_json(io.StringIO(json_data), orient="split")
    # apply time filter
    if tcol!="None" and start_date and end_date:
        dates=pd.to_datetime(df[tcol], unit="s", errors="coerce").dt.date
        df=df[dates.between(pd.to_datetime(start_date).date(), pd.to_datetime(end_date).date())]
    # pick field
    field=None
    if color_by and color_by in df.columns:
        field=color_by
    elif zcol and zcol in df.columns:
        field=zcol
    else:
        return go.Figure()
    data=df[field].dropna()
    fig=go.Figure(go.Histogram(x=data, nbinsx=30))
    fig.update_layout(
        title=f"Distribution of {field}",
        template="plotly_dark" if dark else "plotly_white",
        margin=dict(l=20,r=20,t=30,b=20)
    )
    return fig

# === DatePicker bounds callback ===
@app.callback(
    Output("date-range","min_date_allowed"),
    Output("date-range","max_date_allowed"),
    Output("date-range","start_date"),
    Output("date-range","end_date"),
    Input("df-store","data"),
    Input("time-col","value")
)
def update_date_picker(json_data, tcol):
    if not json_data or tcol=="None":
        return None, None, None, None
    df=pd.read_json(io.StringIO(json_data), orient="split")
    times=pd.to_datetime(df[tcol], unit="s", errors="coerce")
    min_d,max_d=times.min().date(),times.max().date()
    return min_d, max_d, min_d, max_d

# === 10. Run the app ===
if __name__=="__main__":
    app.run(debug=True, port=8051)