const {getSupabase, json} = require("./_shared");

exports.handler = async event => {
  try {
    const id = event.queryStringParameters && event.queryStringParameters.id;
    if (!id) return json(400, {error:"Session ID is missing."});

    const supabase = getSupabase();
    const {data, error} = await supabase.from("attendance_sessions")
      .select("id,title,opens_at,late_after,closes_at,closed_message")
      .eq("id", id).single();

    if (error || !data) return json(404, {error:"Attendance session not found."});

    const now = new Date();
    let currentStatus = "present";
    if (now < new Date(data.opens_at)) currentStatus = "not_open";
    else if (now > new Date(data.closes_at)) currentStatus = "closed";
    else if (now > new Date(data.late_after)) currentStatus = "late";

    return json(200, {session:data,currentStatus});
  } catch (error) {
    return json(500, {error:error.message});
  }
};
