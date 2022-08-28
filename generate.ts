import database from "./database-v2.json";

/*
0. 케이스에 매칭되는 PFP 생성해야합니다.
케바케 PFP는 랜덤이 아닌
기존 케이스의 프로퍼티에 매칭되는 파츠 이미지로 구성되어야 합니다.

0-1. PFP에 반영되는 케이스의 프로퍼티
과도한 작업량을 줄이기 위해, 
케이스의 모든 프로퍼티를 PFP 파츠로 반영하지 않았습니다.
반영된 프로퍼티 그룹은 다음과 같습니다.
* 반영된 그룹 : AGE / MURDER TOOL / CLOTHE / HEADWEAR / TIME / SOUND
* 반영되지 않은 그룹 : SHOES / ACCESSORY / JOB / PLACE / TRACE 

0-2. 나이의 표기
20대는 20s, 30대는 30s, ..., 60대는 60s로 표기됩니다.
 */

// 드로잉 순서
// SOUND -> TIME -> HAND1 -> MURDER TOOL -> HAND2 -> BODY -> CLOTHE -> HEADWEAR
(async () => {


})();
