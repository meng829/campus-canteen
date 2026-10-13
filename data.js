// ===== 校园食堂点评推荐 · 种子数据 =====
// 纯前端演示数据。用户自己发布的点评保存在浏览器 localStorage，不修改本文件。

const CANTEENS = [
  { id: "c1", name: "学苑食堂（一食堂）", location: "教学楼A旁 · 离宿舍最近", hours: "06:30-20:30", emoji: "🍚" },
  { id: "c2", name: "沁园食堂（二食堂）", location: "图书馆北侧", hours: "07:00-21:00", emoji: "🍜" },
  { id: "c3", name: "清真食堂", location: "操场西侧", hours: "07:00-20:00", emoji: "🍢" },
  { id: "c4", name: "风味广场（三食堂）", location: "南门商业街二楼", hours: "10:00-22:00", emoji: "🌶️" },
];

// queue: 排队情况 1=畅通 2=一般 3=爆满
const WINDOWS = [
  { id: "w1", canteen: "c1", name: "家常小炒", cuisine: "家常菜", emoji: "🥘", queue: 2 },
  { id: "w2", canteen: "c1", name: "自选快餐", cuisine: "盖浇饭", emoji: "🍛", queue: 3 },
  { id: "w3", canteen: "c1", name: "早餐面点", cuisine: "早餐", emoji: "🥟", queue: 1 },
  { id: "w4", canteen: "c2", name: "陕西面馆", cuisine: "面食", emoji: "🍜", queue: 2 },
  { id: "w5", canteen: "c2", name: "砂锅米线", cuisine: "米线", emoji: "🍲", queue: 2 },
  { id: "w6", canteen: "c2", name: "轻食沙拉", cuisine: "轻食", emoji: "🥗", queue: 1 },
  { id: "w7", canteen: "c3", name: "兰州牛肉面", cuisine: "清真面食", emoji: "🍜", queue: 3 },
  { id: "w8", canteen: "c3", name: "新疆大盘鸡", cuisine: "清真炒菜", emoji: "🍗", queue: 2 },
  { id: "w9", canteen: "c4", name: "麻辣香锅", cuisine: "川湘", emoji: "🌶️", queue: 3 },
  { id: "w10", canteen: "c4", name: "烤肉拌饭", cuisine: "韩式", emoji: "🍖", queue: 2 },
  { id: "w11", canteen: "c4", name: "铁板鱿鱼", cuisine: "小吃", emoji: "🦑", queue: 1 },
  { id: "w12", canteen: "c4", name: "螺蛳粉专门店", cuisine: "桂菜", emoji: "🍥", queue: 2 },
];

// spicy: 0 不辣 / 1 微辣 / 2 中辣 / 3 重辣
const DISHES = [
  { id: "d1", w: "w1", name: "西红柿炒蛋盖饭", price: 12, emoji: "🍅", desc: "酸甜下饭的经典款，鸡蛋给得足，份量管饱。", spicy: 0, tags: ["素食可选", "下饭", "份量足"], isNew: false, base: 4.6, count: 128 },
  { id: "d2", w: "w1", name: "青椒肉丝盖饭", price: 14, emoji: "🫑", desc: "肉丝嫩、青椒脆，咸香微辣，性价比不错。", spicy: 1, tags: ["下饭", "荤素搭配"], isNew: false, base: 4.3, count: 96 },
  { id: "d3", w: "w1", name: "干煸四季豆", price: 13, emoji: "🫘", desc: "煸得干香入味，就是有点油，配米饭刚好。", spicy: 1, tags: ["素食可选", "偏油"], isNew: true, base: 4.0, count: 21 },
  { id: "d4", w: "w2", name: "红烧肉套餐", price: 18, emoji: "🍖", desc: "肥而不腻、入口即化，但今天有点咸，肉块偏少。", spicy: 0, tags: ["硬菜", "偏贵"], isNew: false, base: 3.4, count: 88 },
  { id: "d5", w: "w2", name: "咖喱鸡肉饭", price: 15, emoji: "🍛", desc: "咖喱浓香，鸡肉嫩，配菜有土豆胡萝卜，暖胃。", spicy: 1, tags: ["人气", "份量足"], isNew: false, base: 4.5, count: 143 },
  { id: "d6", w: "w3", name: "鲜肉小笼包（8只）", price: 8, emoji: "🥟", desc: "皮薄汁多，早八神器，去晚了就没了。", spicy: 0, tags: ["早餐", "性价比高"], isNew: false, base: 4.7, count: 210 },
  { id: "d7", w: "w3", name: "豆浆+茶叶蛋", price: 5, emoji: "🥚", desc: "现磨豆浆香浓，茶叶蛋入味，5块钱搞定早餐。", spicy: 0, tags: ["早餐", "便宜"], isNew: false, base: 4.4, count: 176 },
  { id: "d8", w: "w4", name: "油泼biangbiang面", price: 16, emoji: "🍜", desc: "面宽厚筋道，油泼辣子香气足，分量很大。", spicy: 2, tags: ["地方特色", "分量大", "人气"], isNew: false, base: 4.8, count: 305 },
  { id: "d9", w: "w4", name: "西红柿鸡蛋面", price: 13, emoji: "🍝", desc: "汤头清爽，面条偏软，适合不想吃辣的时候。", spicy: 0, tags: ["清淡", "汤面"], isNew: false, base: 4.1, count: 74 },
  { id: "d10", w: "w5", name: "砂锅土豆粉", price: 14, emoji: "🍲", desc: "砂锅滚烫，土豆粉Q弹，配菜丰富，冬天必点。", spicy: 2, tags: ["暖胃", "配菜多"], isNew: false, base: 4.4, count: 118 },
  { id: "d11", w: "w5", name: "过桥米线", price: 15, emoji: "🍜", desc: "汤鲜料足，米线爽滑，就是排队有点久。", spicy: 1, tags: ["汤鲜", "排队久"], isNew: false, base: 4.2, count: 90 },
  { id: "d12", w: "w6", name: "鸡胸肉藜麦沙拉", price: 20, emoji: "🥗", desc: "低卡高蛋白，酱料单独放，健身党福音，略贵。", spicy: 0, tags: ["低卡", "健身", "偏贵"], isNew: true, base: 4.0, count: 33 },
  { id: "d13", w: "w7", name: "兰州牛肉面（大碗）", price: 15, emoji: "🍜", desc: "一清二白三红四绿，汤清肉香，面条现拉，排队王。", spicy: 1, tags: ["清真", "人气", "排队久"], isNew: false, base: 4.7, count: 402 },
  { id: "d14", w: "w7", name: "牛肉小饭", price: 17, emoji: "🍚", desc: "牛肉粒多，米饭浇上浓汤，实在顶饱。", spicy: 1, tags: ["清真", "份量足"], isNew: false, base: 4.3, count: 66 },
  { id: "d15", w: "w8", name: "新疆大盘鸡（两人份）", price: 42, emoji: "🍗", desc: "鸡肉入味、土豆软糯、宽面筋道，适合两人分享。", spicy: 2, tags: ["清真", "分享", "硬菜"], isNew: false, base: 4.6, count: 154 },
  { id: "d16", w: "w8", name: "手抓饭", price: 18, emoji: "🍚", desc: "胡萝卜羊肉焖饭，油润咸香，配酸奶解腻。", spicy: 0, tags: ["清真", "偏油"], isNew: false, base: 4.1, count: 58 },
  { id: "d17", w: "w9", name: "麻辣香锅（自选）", price: 25, emoji: "🌶️", desc: "食材自选、现炒够辣，人均偏贵但过瘾，重辣慎点。", spicy: 3, tags: ["川湘", "自选", "重辣", "偏贵"], isNew: false, base: 4.4, count: 267 },
  { id: "d18", w: "w9", name: "冒菜", price: 18, emoji: "🥬", desc: "一人食版香锅，汤底麻辣，菜量实在。", spicy: 3, tags: ["川湘", "一人食", "重辣"], isNew: false, base: 4.0, count: 81 },
  { id: "d19", w: "w10", name: "韩式烤肉拌饭", price: 19, emoji: "🍖", desc: "烤肉香、锅巴脆，拌上酱料和溏心蛋，人气很高。", spicy: 1, tags: ["韩式", "人气", "有锅巴"], isNew: false, base: 4.5, count: 189 },
  { id: "d20", w: "w10", name: "石锅拌饭", price: 17, emoji: "🍲", desc: "石锅保温，蔬菜多，酱偏甜，性价比高。", spicy: 1, tags: ["韩式", "素食可选"], isNew: false, base: 4.2, count: 72 },
  { id: "d21", w: "w11", name: "铁板鱿鱼串", price: 10, emoji: "🦑", desc: "现烤铁板、酱香十足，宵夜解馋首选。", spicy: 2, tags: ["小吃", "宵夜"], isNew: false, base: 3.9, count: 64 },
  { id: "d22", w: "w11", name: "烤冷面", price: 9, emoji: "🥡", desc: "酸甜微辣，加蛋加肠更香，就是有点齁。", spicy: 1, tags: ["小吃", "宵夜", "偏甜"], isNew: false, base: 3.6, count: 47 },
  { id: "d23", w: "w12", name: "招牌螺蛳粉", price: 16, emoji: "🍥", desc: "酸笋够味、汤底浓郁，爱的人上头，注意气味。", spicy: 2, tags: ["地方特色", "重口", "气味大"], isNew: true, base: 4.3, count: 156 },
  { id: "d24", w: "w12", name: "卤味双拼饭", price: 15, emoji: "🍗", desc: "卤蛋+卤豆干+米饭，中规中矩，赶时间可以吃。", spicy: 1, tags: ["快餐", "中规中矩"], isNew: false, base: 2.9, count: 39 },
];

// 种子点评（dish = 菜品id）。用户新增的点评会与此合并展示。
const SEED_REVIEWS = [
  { id: "r1", dish: "d8", user: "爱吃面的猫", stars: 5, taste: 5, portion: 5, value: 4, wait: 3, text: "面是真的宽真的筋道，油泼辣子香到跺脚！大碗16块吃到撑，唯一缺点是饭点要排队。", tags: ["分量大", "味道赞"], time: "2026-10-08 12:20", likes: 42 },
  { id: "r2", dish: "d8", user: "匿名用户", stars: 5, taste: 5, portion: 5, value: 5, wait: 2, text: "作为陕西人认证，这家油泼面很正宗，建议加个蛋。", tags: ["正宗"], time: "2026-10-05 18:40", likes: 18 },
  { id: "r3", dish: "d13", user: "汤都要喝光", stars: 5, taste: 5, portion: 4, value: 4, wait: 2, text: "汤清亮、萝卜白、辣油红，牛肉给的不少。饭点排队久，建议错峰。", tags: ["汤鲜", "排队久"], time: "2026-10-09 12:05", likes: 35 },
  { id: "r4", dish: "d13", user: "早八打工人", stars: 4, taste: 4, portion: 4, value: 4, wait: 1, text: "味道稳定，就是中午人太多，等位15分钟起。", tags: ["味道稳定"], time: "2026-10-02 11:50", likes: 9 },
  { id: "r5", dish: "d4", user: "踩雷预警员", stars: 2, taste: 2, portion: 2, value: 2, wait: 4, text: "今天红烧肉偏咸而且肉块很少，18块不太值，肥的还多。踩雷了。", tags: ["偏咸", "性价比低"], time: "2026-10-07 12:30", likes: 27 },
  { id: "r6", dish: "d4", user: "匿名用户", stars: 3, taste: 3, portion: 3, value: 3, wait: 4, text: "味道时好时坏，看厨师发挥，价格偏贵。", tags: ["发挥不稳定"], time: "2026-09-28 18:10", likes: 5 },
  { id: "r7", dish: "d17", user: "无辣不欢", stars: 5, taste: 5, portion: 4, value: 3, wait: 2, text: "自选食材很爽，炒得够香够辣！就是人均25+有点贵，重辣党狂喜。", tags: ["够辣", "偏贵"], time: "2026-10-06 19:00", likes: 31 },
  { id: "r8", dish: "d6", user: "早起困难户", stars: 5, taste: 5, portion: 4, value: 5, wait: 4, text: "8块钱8个小笼包，皮薄汁多，早八救命。但要早点去，7点半后就卖光了。", tags: ["性价比高", "去晚了没"], time: "2026-10-10 07:15", likes: 50 },
  { id: "r9", dish: "d5", user: "咖喱控", stars: 5, taste: 5, portion: 5, value: 4, wait: 4, text: "咖喱味很浓，鸡肉嫩，份量足，冬天吃很暖。", tags: ["份量足", "暖胃"], time: "2026-10-04 12:15", likes: 22 },
  { id: "r10", dish: "d15", user: "干饭二人组", stars: 5, taste: 5, portion: 5, value: 4, wait: 3, text: "两个人点一份大盘鸡加面完全够，土豆软糯鸡肉香，宽面吸满汤汁绝了。", tags: ["适合分享", "硬菜"], time: "2026-10-03 18:30", likes: 44 },
  { id: "r11", dish: "d23", user: "螺蛳粉信徒", stars: 5, taste: 5, portion: 4, value: 4, wait: 3, text: "酸笋够臭够味，汤底浓郁，加个卤蛋完美。介意气味的慎入哈哈。", tags: ["重口", "够味"], time: "2026-10-09 19:20", likes: 26 },
  { id: "r12", dish: "d24", user: "赶due选手", stars: 2, taste: 3, portion: 3, value: 2, wait: 5, text: "卤味偏干偏咸，米饭有点硬，胜在出餐快。实在没得吃才选。", tags: ["偏咸", "出餐快"], time: "2026-10-01 12:40", likes: 11 },
  { id: "r13", dish: "d19", user: "锅巴爱好者", stars: 5, taste: 5, portion: 4, value: 4, wait: 3, text: "烤肉香，底部锅巴脆脆的，拌上酱和溏心蛋太满足了。", tags: ["有锅巴", "人气"], time: "2026-10-08 18:50", likes: 38 },
  { id: "r14", dish: "d10", user: "冬天要吃烫的", stars: 4, taste: 4, portion: 4, value: 4, wait: 3, text: "砂锅端上来还在咕嘟咕嘟，土豆粉Q弹，冬天吃太舒服了。有点辣。", tags: ["暖胃", "微辣"], time: "2026-10-07 18:20", likes: 14 },
  { id: "r15", dish: "d1", user: "素食友好", stars: 5, taste: 4, portion: 5, value: 5, wait: 4, text: "12块西红柿炒蛋盖饭，蛋给得超多，酸甜下饭，穷鬼套餐首选。", tags: ["性价比高", "下饭"], time: "2026-10-06 12:10", likes: 20 },
  { id: "r16", dish: "d12", user: "健身中的我", stars: 4, taste: 4, portion: 3, value: 3, wait: 5, text: "低卡高蛋白，减脂期能吃，就是20块份量一般，酱料记得少放。", tags: ["低卡", "偏贵"], time: "2026-10-09 11:40", likes: 8 },
  { id: "r17", dish: "d7", user: "省钱小能手", stars: 5, taste: 4, portion: 4, value: 5, wait: 5, text: "5块钱豆浆茶叶蛋，出餐飞快，赶早八完全来得及。", tags: ["便宜", "出餐快"], time: "2026-10-10 07:00", likes: 16 },
];

// 口味标签体系（用于偏好设置与推荐）
const TASTE_TAGS = ["川湘", "面食", "清真", "韩式", "轻食", "小吃", "早餐", "家常菜", "米线", "桂菜"];
