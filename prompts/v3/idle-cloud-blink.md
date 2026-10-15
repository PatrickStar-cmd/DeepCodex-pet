# v3.2 云端待机眨眼

使用内置 ImageGen 编辑，透明背景。第一张参考是 `source/v3-smooth/frames/000.png` 等比放大的编辑目标；第二张是更新前从云端下载的 v3 图集，作为角色身份参考。

> Edit only the eyelids/eyes of the first image: close BOTH eyes fully in a calm, cute blink, two simple dark curved eyelash lines, no irises or pupils visible. Keep the small gentle closed mouth unchanged. Preserve the exact first image canvas aspect ratio, full seated pose, head angle upright, head and body location/size, navy-to-cyan hair, white maid headdress, blue bow, cheeks, fin ears, whale tail, clothing, hands resting on lap, shoes, all transparent margins, all pixel registration. No half-closed intermediate, no extra poses, no new elements, no text, no contact sheet, no background. Produce one transparent RGBA image matching the edit target composition.

生成结果保存为 `source/v3-blink/closed-generated.png`。构建只合成两处眼部区域；头发、嘴、头部位置、身体和其他动作行使用原有像素。六个待机槽位按睁眼、闭眼、睁眼、睁眼、睁眼、睁眼排列，不使用半闭眼中间态。
