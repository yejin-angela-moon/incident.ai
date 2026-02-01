from pathlib import Path
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Incident Dashboard", page_icon="🚨", layout="wide")

ROOT_PATH = Path(__file__).resolve().parent
CSV_PATH = ROOT_PATH / "incidents.csv"


def parse_owners(s):
    # Parse top owners of error data
    if pd.isna(s) or not str(s).strip():
        return []
    parts = str(s).split("|")
    out = []
    for p in parts:
        if ":" not in p:
            continue
        name, pct = p.split(":", 1)
        name = name.strip()
        try:
            pct = float(pct.strip())
        except:
            pct = None
        out.append((name, pct))
    return out


def error_owner(s):
    owners = parse_owners(s)
    if not owners:
        return "—"
    return " · ".join([f"{n} {int(p)}%" if p is not None else n for n, p in owners])


def parse_commit_list(s):
    # Parsing the available repo commit list
    if pd.isna(s) or not str(s).strip():
        return []
    items = str(s).split(";")
    out = []
    for it in items:
        it = it.strip()
        if not it:
            continue
        # author message
        sha = ""
        msg = it
        author = ""
        if ":" in it:
            sha, rest = it.split(":", 1)
            msg = rest
        if "@“" in msg:  # Special case of quotes
            msg = msg.replace("“", '"').replace("”", '"')
        if "@" in msg:
            msg, author = msg.rsplit("@", 1)
        out.append(
            {"sha": sha.strip(), "message": msg.strip(), "author": author.strip()}
        )
    return out


# Load page
st.title("🚨 Incident Dashboard")

if not CSV_PATH.exists():
    st.error(f"CSV not found at: {CSV_PATH}")
    st.stop()

df = pd.read_csv(CSV_PATH)

# Parse existing columns
for col in [
    "timestamp",
    "repo",
    "file",
    "line",
    "error_name",
    "error_message",
    "top_frame",
    "owners_top3",
    "commit_list",
    "slack_text",
    "incident_id",
]:
    if col not in df.columns:
        df[col] = ""

# Timestamp parsing
if "timestamp" in df.columns:
    df["timestamp_dt"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.sort_values("timestamp_dt", ascending=False, na_position="last")

# Filters - on the left-hand side of the screen
st.sidebar.header("Filters")
repo_filter = st.sidebar.text_input("Repo contains", "")
error_filter = st.sidebar.text_input("Error contains", "")

filtered = df.copy()
if repo_filter:
    filtered = filtered[
        filtered["repo"].astype(str).str.contains(repo_filter, case=False, na=False)
    ]
if error_filter:
    filtered = filtered[
        filtered["error_name"]
        .astype(str)
        .str.contains(error_filter, case=False, na=False)
        | filtered["error_message"]
        .astype(str)
        .str.contains(error_filter, case=False, na=False)
    ]


# Helper for pluralization
def pluralize(count, singular, plural=None):
    if plural is None:
        plural = singular + "s"
    return f"{count} {singular if count == 1 else plural}"


# Column Components - 2 rows of 2 metrics with organic labels
row1_c1, row1_c2 = st.columns(2, gap="small")
incident_count = len(filtered)
repo_count = filtered["repo"].nunique()
row1_c1.metric(label="Total", value=pluralize(incident_count, "incident"))
row1_c2.metric(label="Affected", value=pluralize(repo_count, "repo"))

row2_c1, row2_c2 = st.columns(2, gap="small")
error_type_count = filtered["error_name"].nunique()
row2_c1.metric(label="Unique Errors", value=pluralize(error_type_count, "error type"))
if len(filtered) and pd.notna(filtered["timestamp_dt"].iloc[0]):
    latest_ts = filtered["timestamp_dt"].iloc[0].strftime("%b %d, %Y %H:%M")
else:
    latest_ts = "—"
row2_c2.metric(label="Latest Incident", value=latest_ts)

st.divider()

# Incidents table - full width
st.subheader("Incidents")

# Create display table
display = filtered.copy()
display["owners"] = display["owners_top3"].apply(error_owner)

# Display critical information
cols = ["timestamp", "repo", "file", "line", "error_name", "error_message", "owners"]
cols = [c for c in cols if c in display.columns]

st.dataframe(display[cols], use_container_width=True, hide_index=True)

st.divider()

# Incident details - below the table
st.subheader("Incident Details")

if len(filtered) == 0:
    st.info("No incidents match your filters.")
else:
    # Selector Label
    def label(row):
        ts = row.get("timestamp", "")
        repo = row.get("repo", "")
        err = row.get("error_name", "")
        msg = str(row.get("error_message", ""))[:60]
        return f"{ts} — {repo} — {err}: {msg}"

    options = list(filtered.index)
    selected_idx = st.selectbox(
        "Select an incident", options, format_func=lambda i: label(filtered.loc[i])
    )
    row = filtered.loc[selected_idx]

    # Key Info
    st.markdown(f"**Repo:** `{row['repo']}`")
    st.markdown(f"**Location:** `{row['file']}:{row['line']}`")
    if row.get("top_frame"):
        st.markdown(f"**Top frame:** `{row['top_frame']}`")
    st.markdown(f"**Error:** **{row['error_name']}** — {row['error_message']}")

    st.markdown("### Owners (Top 3)")
    owners = parse_owners(row.get("owners_top3", ""))
    if owners:
        for name, pct in owners:
            if pct is None:
                st.write(f"- {name}")
            else:
                st.progress(
                    min(max(pct / 100.0, 0.0), 1.0), text=f"{name} — {int(pct)}%"
                )
    else:
        st.write("—")

    st.markdown("### Recent commits")
    commits = parse_commit_list(row.get("commit_list", ""))
    if commits:
        commit_df = pd.DataFrame(commits)
        st.dataframe(commit_df, use_container_width=True, hide_index=True)
    else:
        st.write("—")

    with st.expander("Claude / Slack summary"):
        st.text(row.get("slack_text", "") or "")
