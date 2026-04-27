export const personaOrder = [
  "GOAT",
  "FANA",
  "GURU",
  "SOFA",
  "RIOT",
  "MUTE",
  "YOLO",
  "VIBE",
  "SALT",
  "JINX",
  "MOOD",
  "CLIP",
  "CHEF",
  "MONK",
  "SOUL",
  "DRIP"
];

export const personaVectors = {
  GOAT: [1, 1, 2, 3, 2, 2, 3, 2],
  FANA: [1, 2, 3, 3, 2, 2, 3, 2],
  GURU: [2, 1, 1, 2, 1, 2, 2, 2],
  SOFA: [2, 2, 2, 2, 2, 3, 2, 1],
  RIOT: [2, 2, 3, 3, 2, 3, 2, 2],
  MUTE: [1, 2, 2, 2, 1, 1, 2, 2],
  YOLO: [2, 2, 2, 2, 2, 2, 2, 3],
  VIBE: [3, 3, 3, 2, 3, 3, 2, 2],
  SALT: [2, 2, 2, 2, 2, 3, 2, 2],
  JINX: [2, 2, 2, 1, 2, 2, 2, 3],
  MOOD: [3, 2, 2, 2, 2, 2, 1, 2],
  CLIP: [3, 3, 1, 1, 2, 1, 1, 1],
  CHEF: [3, 3, 2, 2, 3, 2, 2, 1],
  MONK: [3, 3, 1, 1, 1, 1, 1, 1],
  SOUL: [2, 2, 3, 1, 2, 2, 3, 2],
  DRIP: [2, 3, 3, 2, 2, 2, 2, 2]
};

export const personas = {
  GOAT: {
    code: "GOAT",
    name: "绿茵教父",
    oneLiner:
      "既然认准了这抹颜色，这辈子就跟它死磕到底了。信仰滚烫，热爱不需要理由。",
    description:
      "你把支持一支球队当成长期主义。输赢会影响情绪，但不会改变立场；比赛之外，你更在意球队的精神传承和历史厚度。",
    tags: ["信仰守护者", "长线投入", "绝不转会", "主队本命"],
    rival: "JINX 毒奶体质",
    partner: "GURU 野生教练",
    star: "莫德里奇型耐久信徒"
  },
  FANA: {
    code: "FANA",
    name: "熬夜圣体",
    oneLiner: "熬最深的夜，看最燃的球。开球哨就是你的闹钟。",
    description:
      "你愿意为了世界杯主动调整生活节奏。只要比赛值得看，再晚都能进入作战状态，赛程表和提醒比多数人的闹钟更可靠。",
    tags: ["深夜硬核党", "赛程敏感", "通知全开", "体力置换热爱"],
    rival: "MONK 局外人",
    partner: "RIOT 易燃易爆",
    star: "孙兴慜型高能连续作战者"
  },
  GURU: {
    code: "GURU",
    name: "野生教练",
    oneLiner: "别人看球路，你看阵型和空间。",
    description:
      "你关注的不只是比分，而是比赛如何被组织出来。复盘、热力图和换人时机，都是你理解足球的方式。",
    tags: ["阵型雷达", "复盘脑", "技术流", "战术洁癖"],
    rival: "DRIP 第六感球迷",
    partner: "GOAT 绿茵教父",
    star: "瓜迪奥拉型场边灵魂"
  },
  SOFA: {
    code: "SOFA",
    name: "场外指导",
    oneLiner: "脚下是拖鞋，心里装的是大力神杯。",
    description:
      "你享受指点江山的掌控感。虽然人在屏幕前，但会天然代入教练视角，在舒适区里完成全局调度。",
    tags: ["遥控器主帅", "家庭战术板", "场外布阵", "舒适观赛派"],
    rival: "RIOT 易燃易爆",
    partner: "CHEF 后勤部长",
    star: "安切洛蒂型客厅控场者"
  },
  RIOT: {
    code: "RIOT",
    name: "易燃易爆",
    oneLiner: "情绪来得快，声量更快，你是主场的扩音器。",
    description:
      "你看球时不会压抑能量。绝杀、误判、逆转都会被你放大成现场级别的情绪冲击，评论区和客厅都会被你点燃。",
    tags: ["绝杀扩音器", "真性情", "高压心跳", "主场火种"],
    rival: "MONK 局外人",
    partner: "VIBE 气氛组担当",
    star: "内马尔型高波动表达者"
  },
  MUTE: {
    code: "MUTE",
    name: "深水炸弹",
    oneLiner: "表面克制，内心早已翻涌八百回合。",
    description:
      "你不喜欢把情绪直接摊开，但并不冷淡。重要时刻的短暂爆发，反而更能证明你在每一秒都投入得很深。",
    tags: ["冷面滚烫", "压低声量", "稳态观看", "深情克制"],
    rival: "VIBE 气氛组担当",
    partner: "SOUL 散场诗人",
    star: "因扎吉型安静猎手"
  },
  YOLO: {
    code: "YOLO",
    name: "冷门刺客",
    oneLiner: "强队是常识，黑马才是奇迹。",
    description:
      "你天然偏爱不被看好的故事。热门剧本很稳，但你更愿意押注意外和逆袭，因为那才是世界杯让人上头的原因。",
    tags: ["黑马观察员", "逆袭执念", "反热门", "冒险下注"],
    rival: "GOAT 绿茵教父",
    partner: "JINX 毒奶体质",
    star: "莱斯特城型奇迹策士"
  },
  VIBE: {
    code: "VIBE",
    name: "气氛组担当",
    oneLiner: "战术不一定全懂，但气氛必须拉满。",
    description:
      "你看重的是一起看球的那种热闹与联结。只要场子需要，旗子、喇叭和情绪价值你都能一把补齐。",
    tags: ["社交燃料", "夜宵扩散器", "主场组织者", "狂欢感知器"],
    rival: "MUTE 深水炸弹",
    partner: "RIOT 易燃易爆",
    star: "贝克汉姆型聚场中心"
  },
  SALT: {
    code: "SALT",
    name: "嘴强王者",
    oneLiner: "评论区是你的第二主场，对线是看球附加赛。",
    description:
      "你不会放过离谱观点，也不怕站在多数人的对立面。你享受把逻辑、资料和语气一起拉满的辩论快感。",
    tags: ["评论区主将", "资料对线", "观点洁癖", "高频开麦"],
    rival: "MONK 局外人",
    partner: "TROL 杠精球评家",
    star: "穆里尼奥型发布会选手"
  },
  JINX: {
    code: "JINX",
    name: "毒奶体质",
    oneLiner: "你一句稳了，往往比战术分析更有戏剧性。",
    description:
      "你对比赛有自己的预感，但这份预感经常以反向方式应验。你会继续猜，因为你知道玄学也是世界杯的一部分。",
    tags: ["反向指标", "玄学观察", "竞猜异能", "冷门吸附体"],
    rival: "GOAT 绿茵教父",
    partner: "YOLO 冷门刺客",
    star: "章鱼保罗型玄学接口"
  },
  MOOD: {
    code: "MOOD",
    name: "墙头球迷",
    oneLiner: "谁踢得好看，你就为谁欢呼，快乐优先。",
    description:
      "你不愿意把全部情绪压在一支球队身上。漂亮足球、鲜明球星和即时爽感比长期绑定更重要，观赛体验永远第一。",
    tags: ["快乐优先", "审美驱动", "轻绑定", "风格追随者"],
    rival: "GOAT 绿茵教父",
    partner: "CLIP 三分钟热度",
    star: "罗纳尔迪尼奥型快乐自由派"
  },
  CLIP: {
    code: "CLIP",
    name: "三分钟热度",
    oneLiner: "90 分钟太长，你只收藏最亮的高光。",
    description:
      "你擅长用最短时间抓住世界杯的多巴胺精华。集锦、名场面和情绪峰值，是你理解赛事的主要入口。",
    tags: ["高光收集", "效率观赛", "名场面优先", "短视频脑回路"],
    rival: "GURU 野生教练",
    partner: "MOOD 墙头球迷",
    star: "姆巴佩型瞬时爆点爱好者"
  },
  CHEF: {
    code: "CHEF",
    name: "后勤部长",
    oneLiner: "比赛是理由，烟火气才是你组织聚会的本体。",
    description:
      "你擅长把观赛变成一场完整的局。谁来、吃什么、几点开看、谁负责带饮料，这些你会比比分更早规划好。",
    tags: ["夜宵策展人", "组局总控", "物资充足", "朋友增益器"],
    rival: "MONK 局外人",
    partner: "SOFA 场外指导",
    star: "克洛普型更衣室氛围官"
  },
  MONK: {
    code: "MONK",
    name: "局外人",
    oneLiner: "别人破防，你在稳住自己的内心海平面。",
    description:
      "你看球时更像冷静的旁观者。赛事再热闹，也很难彻底带走你的情绪；你会看，但不会被它轻易裹挟。",
    tags: ["情绪低噪", "平和观测", "淡定旁观", "慢反应"],
    rival: "RIOT 易燃易爆",
    partner: "MUTE 深水炸弹",
    star: "布冯型沉着定盘星"
  },
  SOUL: {
    code: "SOUL",
    name: "散场诗人",
    oneLiner: "你在比赛里寻找的，不只是胜负，还有青春的回声。",
    description:
      "你对足球的感知里带着很强的情绪余韵。球星谢幕、老将背影和雨夜灯光，都会比比分更久地留在记忆里。",
    tags: ["情怀放映机", "回忆增强器", "老将注视者", "慢热共鸣"],
    rival: "CLIP 三分钟热度",
    partner: "MUTE 深水炸弹",
    star: "梅西型时代见证者"
  },
  DRIP: {
    code: "DRIP",
    name: "第六感球迷",
    oneLiner: "别拿数据压你，直觉先一步告诉你风向。",
    description:
      "你相信现场气味、状态波动和不言自明的转机感。你的判断不总有证据，但常常有一种难以解释的准。",
    tags: ["直觉开路", "感受先行", "风向捕手", "玄学洞察"],
    rival: "GURU 野生教练",
    partner: "YOLO 冷门刺客",
    star: "齐达内型灵感球感派"
  },
  TROL: {
    code: "TROL",
    name: "杠精球评家",
    oneLiner:
      "我不是故意抬杠，我只是觉得这个世界的观点太单一了。如果不跟我过两招，你怎么知道自己的热爱有多深？",
    description:
      "你把专业、表达和社交克制拼成了一种独特矛盾体。你未必喜欢线下热闹，但在线上辩论里战斗力极高。",
    tags: ["线上键盘侠", "高强度抬杠", "资料库", "社恐开麦"],
    rival: "MONK 局外人",
    partner: "SALT 嘴强王者",
    star: "基恩型硬核辩论者",
    isHidden: true
  },
  HERO: {
    code: "HERO",
    name: "四年一醒",
    oneLiner:
      "平时我是个路人甲，世界杯开始的那一刻，我能比任何死忠都更疯狂。",
    description:
      "你平时未必高频关注足球，但一旦世界杯开场，就会迅速切换成投入模式。这种周期性觉醒，是你独有的观赛节律。",
    tags: ["赛事限定狂热", "临时觉醒", "四年蓄能", "矛盾体"],
    rival: "GOAT 绿茵教父",
    partner: "VIBE 气氛组担当",
    star: "大赛限定型热情玩家",
    isHidden: true
  }
};
