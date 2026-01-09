import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import { config } from "./config.js";
import { retry } from "./utils/retry.js";

const BASE = config.ntnu.baseUrl;
const INDEX = `${BASE}${config.ntnu.indexPath}`;
const API = `${BASE}${config.ntnu.apiPath}`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function createClient() {
  const jar = new CookieJar();
  const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers: {
      Referer: INDEX,
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "zh-TW,zh;q=0.9"
    }
  }));

  await client.get(INDEX);
  await sleep(500);
  return client;
}

export async function fetchOneCourse({ year, term, courseCode }) {
  return retry(async () => {
    const client = await createClient();

    const res = await client.get(API, {
      params: {
        _dc: Date.now(),
        acadmYear: year,
        acadmTerm: term,
        course_code: courseCode,
        action: "showGrid",
        language: "chinese",
        start: 0,
        limit: 5,
        page: 1,
        chn: "",
        engTeach: "N",
        clang: "N",
        moocs: "N",
        remoteCourse: "N",
        digital: "N",
        adsl: "N",
        deptCode: "",
        zuDept: "",
        classCode: "",
        kind: "",
        generalCore: "",
        teacher: "",
        serial_number: ""
      }
    });

    const c = res?.data?.List?.[0];
    if (!c) return null;

    return {
      name: c.chn_name,
      teacher: c.teacher,

      counter: Number(c.counter_exceptAuth),
      authUsed: Number(c.authorize_using),
      authLimit: Number(c.authorize_p),

      limit: Number(c.limit_count_h),

      raw: c
    };
  });
}
