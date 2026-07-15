const {getSupabase, json, requireAdmin} = require("./_shared");

exports.handler = async event => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return json(405, {error:"Method not allowed."});
  if (!requireAdmin(event)) return json(401, {error:"Unauthorized."});

  try {
    const body = JSON.parse(event.body || "{}");
    if (!body.title || !body.opensAt || !body.lateAfter || !body.closesAt) {
      return json(400, {error:"Required session fields are missing."});
    }

    const supabase = getSupabase();
    const {data, error} = await supabase.from("attendance_sessions").insert({
      title: body.title,
      opens_at: body.opensAt,
      late_after: body.lateAfter,
      closes_at: body.closesAt,
      latitude: body.latitude,
      longitude: body.longitude,
      radius_meters: body.radius,
      on_time_message: body.onTimeMessage,
      late_message: body.lateMessage,
      closed_message: body.closedMessage
    }).select().single();

    if (error) throw error;
    return json(200, {session:data});
  } catch (error) {
    return json(500, {error:error.message});
  }
};
