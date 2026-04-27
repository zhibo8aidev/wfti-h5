export function getActivityConfig(uid) {
  const now = new Date().toISOString();
  return {
    activity: {
      id: "wfti-h5",
      title: "世界杯球迷人格大鉴赏",
      status: "online",
      starts_at: "2026-06-01T00:00:00+08:00",
      ends_at: "2026-07-31T23:59:59+08:00",
      fetched_at: now,
    },
    share: {
      title: "测测你的世界杯球迷人格",
      description: "16 道题，3 分钟，看你是天生主场派还是隐藏戏精派。",
      link: uid
        ? `https://h5.zhibo8.com/wfti?uid=${encodeURIComponent(uid)}`
        : "https://h5.zhibo8.com/wfti",
      poster_cta: "保存海报，发给球迷朋友一起对线",
    },
    qrcode: {
      mode: "url",
      landing_url: "https://app.zhibo8.com/worldcup/topic/wfti",
      image_url: "",
      hint: "扫码进入世界杯专题，解锁更多人格玩法",
    },
    in_app_routes: {
      topic_home: {
        schema: "zhibo8://worldcup/topic",
        path: "/worldcup/topic",
        fallback_url: "https://app.zhibo8.com/worldcup/topic/wfti",
      },
      community: {
        schema: "zhibo8://community/hot",
        path: "/community/hot",
        fallback_url: "https://app.zhibo8.com/community/hot",
      },
    },
  };
}

export function buildPosterPayload(config) {
  return {
    title: "string",
    personality_name: "string",
    personality_code: "string",
    poster_slogan: config.share.description,
    qrcode: {
      landing_url: config.qrcode.landing_url,
      image_url: "string | optional",
    },
  };
}

export function buildLinkagePayload(result) {
  return {
    uid: result.uid,
    personality_code: result.personality_code,
    personality_name: result.personality_name,
    updated_at: result.updated_at,
    result_summary: {
      level_vector: result.level_vector,
      raw_scores: result.raw_scores,
    },
    consume_scenarios: [
      "worldcup_topic_card",
      "personalized_push",
      "jinx_easter_egg",
      "community_floating_entry",
      "profile_personality_tag",
    ],
  };
}
