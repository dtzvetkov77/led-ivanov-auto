-- Analytics summary RPC — runs server-side aggregation, bypasses PostgREST max-rows limit
CREATE OR REPLACE FUNCTION analytics_summary(since_ts timestamptz)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total', (
      SELECT COUNT(*) FROM analytics_events WHERE created_at >= since_ts
    ),
    'by_day', (
      SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.key), '[]'::json)
      FROM (
        SELECT (created_at AT TIME ZONE 'UTC')::date::text AS key, COUNT(*) AS total
        FROM analytics_events
        WHERE created_at >= since_ts
        GROUP BY (created_at AT TIME ZONE 'UTC')::date
        ORDER BY (created_at AT TIME ZONE 'UTC')::date
      ) t
    ),
    'by_path', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT path AS key, COUNT(*) AS total
        FROM analytics_events
        WHERE created_at >= since_ts
        GROUP BY path
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) t
    ),
    'by_referrer', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT COALESCE(referrer, '') AS key, COUNT(*) AS total
        FROM analytics_events
        WHERE created_at >= since_ts
        GROUP BY referrer
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) t
    ),
    'by_device', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT device AS key, COUNT(*) AS total
        FROM analytics_events
        WHERE created_at >= since_ts AND device IS NOT NULL
        GROUP BY device
        ORDER BY COUNT(*) DESC
      ) t
    ),
    'by_country', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT country AS key, COUNT(*) AS total
        FROM analytics_events
        WHERE created_at >= since_ts AND country IS NOT NULL
        GROUP BY country
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Allow service role to call this function
GRANT EXECUTE ON FUNCTION analytics_summary(timestamptz) TO service_role;
