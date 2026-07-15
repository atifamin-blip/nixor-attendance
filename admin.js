const {getSupabase, json, requireAdmin} = require("./_shared");

exports.handler = async event => {
  if (!requireAdmin(event)) return json(401, {error:"Unauthorized."});

  try {
    const supabase = getSupabase();

    const [{data:records,error:recordsError},{data:sessions,error:sessionsError}] = await Promise.all([
      supabase.from("attendance_records").select("*").order("submitted_at",{ascending:false}).limit(2000),
      supabase.from("attendance_sessions").select("*").order("created_at",{ascending:false}).limit(1)
    ]);

    if (recordsError) throw recordsError;
    if (sessionsError) throw sessionsError;

    return json(200, {records:records || [],latestSession:(sessions || [])[0] || null});
  } catch (error) {
    return json(500, {error:error.message});
  }
};
