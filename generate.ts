import database from "./database-v2.json";
import femaleClothes from "./parts/female-clothes.json";
import maleClothes from "./parts/male-clothes.json";
import unisexClothes from "./parts/unisex-clothes.json";
import femaleHeadwears from "./parts/female-headwears.json";
import maleHeadwears from "./parts/male-headwears.json";
import unisexHeadwears from "./parts/unisex-headwears.json";
import hand1MurderTools from "./parts/hand1-murder-tools.json";
import hand2MurderTools from "./parts/hand2-murder-tools.json";
import hand3MurderTools from "./parts/hand3-murder-tools.json";
import hand4MurderTools from "./parts/hand4-murder-tools.json";
import hand5MurderTools from "./parts/hand5-murder-tools.json";
import { SkyUtil } from "skydapp-common";
import sharp from "sharp";

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

1. 파츠 이미지 적층 순서
폴더 앞 번호 순서에 따라 이미지를 적층해나가야 합니다.
1번 SOUND가 가장 먼저 그려지고, 2번이 그 위를 덮습니다. 
그리고 다시 3번이 그 위(2번 위)를 덮습니다. 
반복해서 8번 HEADWEAR까지 그리고 마무리 됩니다.
*/

(async () => {

    let index = 0;
    for (const _data of database as any) {

        const data: any = {};
        for (const attribute of _data.attributes) {
            data[attribute.trait_type] = attribute.value;
        }

        /*console.log(data.SOUND);
        console.log(data.TIME);
        console.log(data["MURDER TOOL"]);
        console.log(data.CLOTHE);
        console.log(data.HEADWEAR);*/

        /*
        2-1. PFP의 성별
        케이스에는 성별의 개념이 없었습니다.
        하지만 PFP에서는 성별의 개념이 있습니다. 
        이미지가 조합되었을 때, 
        남자 머리에 여자 옷이 나오는 것을 막기 위해서 입니다.
        
        2-2. PFP의 성별에 따라 BODY 모양이 달라집니다.
        
        2-3. PFP의 성별이 정해지는 방법
        (1) 케이스의 HEADWEAR가 무엇인지 봅니다.
        (2) 케이스의 HEADWEAR에 매칭되는 파츠 이미지 HEADWEAR 파일을 찾습니다.
        (3) 파츠 이미지 HEADWEAR 파일 제목에 female, male 또는 unisex 중 어떤 단어가 적혀 있는지 확인합니다.
        (4) female이면 여성, male이면 남성, unisex면 공용입니다.
        */

        let sex: "male" | "female" | "unisex" = "male";
        if (femaleHeadwears.includes(data.HEADWEAR)) {
            sex = "female";
        } else if (unisexHeadwears.includes(data.HEADWEAR)) {
            sex = "unisex";
        }

        /*
        2-4. 까다로운 경우(1) - HEADWEAR와 CLOTHE의 성별이 다를 때
        케이스의 HEADWEAR가 female이어서 
        PFP의 성별을 female로 결정했는데, 
        케이스의 CLOTHE가 남성 옷인 경우가 있습니다.
        이럴 때는 CLOTHE를 여성 옷 중에서 하나로 랜덤 선택하여 입힙니다.
        (HEADWEAR는 바꾸지 않습니다. HEADWEAR가 기준입니다.)
        */
        if (sex === "male" && femaleClothes.includes(data.CLOTHE)) {
            // 이럴 때는 CLOTHE를 남성 옷 중에서 하나로 랜덤 선택하여 입힙니다.
            data.CLOTHE = maleClothes[SkyUtil.random(0, maleClothes.length - 1)];
        } else if (sex === "female" && maleClothes.includes(data.CLOTHE)) {
            // 이럴 때는 CLOTHE를 여성 옷 중에서 하나로 랜덤 선택하여 입힙니다.
            data.CLOTHE = femaleClothes[SkyUtil.random(0, femaleClothes.length - 1)];
        } else if (maleClothes.includes(data.CLOTHE)) {
            sex = "male";
        } else if (femaleClothes.includes(data.CLOTHE)) {
            sex = "female";
        }

        /*
        3. 성별과 나이에 따라 BODY 이미지가 결정됩니다.
        남성과 여성은 쉐이프가 다른 BODY 이미지를 가지고 있습니다.
        20대와 60대는 문양이 다른 BODY 이미지를 가지고 있습니다.
        성별과 나이에 따라 PFP에 사용되는 BODY 이미지가 결정됩니다.
        */
        if (sex === "unisex") {
            sex = SkyUtil.random(0, 1) === 0 ? "male" : "female";
        }
        data.BODY = `${sex}/${data.AGE}`;

        /*
        4. 성별과 나이에 따라 HAND 이미지가 결정됩니다.

        5-1. HAND
        MURDER TOOL마다 적용되는 HAND의 손 모양이 다릅니다.
        MURDER TOOL이 결정되면, 
        파츠 이미지의 MURDER TOOL 제목 앞에 어떤 단어가 있는지 확인합니다.
        hand1, hand2, ..., hand5가 적혀 있습니다.
        5가지의 손모양이 있습니다.
        적힌 단어에 따라 HAND_1st와 HAND_2nd 레이어 이미지가 결정됩니다.

        5-2. HAND_1st와 HAND_2nd는 일대일 대응합니다.
        HAND_1st이 20s_hand2이면 HAND_2nd 또한 20s_hand2여야 합니다.
        */
        if (hand1MurderTools.includes(data["MURDER TOOL"])) {
            data.HAND2 = `${data.AGE}_hand1`;
        } else if (hand2MurderTools.includes(data["MURDER TOOL"])) {
            data.HAND1 = `${data.AGE}_hand2`;
            data.HAND2 = `${data.AGE}_hand2`;
        } else if (hand3MurderTools.includes(data["MURDER TOOL"])) {
            data.HAND1 = `${data.AGE}_hand3`;

            /*
            5-3. 까다로운 경우(1) - 마디마다 스터드가 박힌 두껍고 더러운 금색 너클
            너클의 경우, HAND_2nd를 불러오지 않습니다.
            너클은 손가락에 끼워져 있는 특이한 경우로, 
            HAND_2nd를 불러오면 너클이 가려지게 됩니다.
            */
            if (data["MURDER TOOL"] !== "Studded Dirty Knuckle") {
                data.HAND2 = `${data.AGE}_hand3`;
            }
        } else if (hand4MurderTools.includes(data["MURDER TOOL"])) {
            data.HAND1 = `${data.AGE}_hand4`;
            data.HAND2 = `${data.AGE}_hand4`;
        } else if (hand5MurderTools.includes(data["MURDER TOOL"])) {
            data.HAND1 = `${data.AGE}_hand5`;
            data.HAND2 = `${data.AGE}_hand5`;
        }

        // 드로잉 순서
        // SOUND -> TIME -> HAND1 -> MURDER TOOL -> HAND2 -> BODY -> CLOTHE -> HEADWEAR
        const parameters: any[] = [];
        parameters.push({ input: `parts/SOUND/${data.SOUND}.png` });
        parameters.push({ input: `parts/TIME/${data.TIME}.png` });
        if (data.HAND1 !== undefined) {
            parameters.push({ input: `parts/HAND1/${data.HAND1}.png` });
        }
        parameters.push({ input: `parts/MURDER TOOL/${data["MURDER TOOL"]}.png` });
        if (data.HAND2 !== undefined) {
            parameters.push({ input: `parts/HAND2/${data.HAND2}.png` });
        }
        parameters.push({ input: `parts/BODY/${data.BODY}.png` });
        parameters.push({ input: `parts/CLOTHE/${data.CLOTHE}.png` });
        parameters.push({ input: `parts/HEADWEAR/${data.HEADWEAR}.png` });
        console.log(parameters);

        await sharp({
            create: {
                width: 2048,
                height: 2048,
                channels: 4,
                background: { r: 255, g: 167, b: 173, alpha: 0 }
            }
        })
            .composite(parameters)
            .png()
            .toFile(`results/${index}.png`);

        console.log(`#${index} generated.`);
        index += 1;
    }
})();
