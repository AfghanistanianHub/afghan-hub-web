import assert from "node:assert/strict";
import test from "node:test";
import { categoryOrder, categoryRevealFrame } from "../src/components/public/category-scroll-progress.ts";

test("categories retain the same vertical navigation order", () => {
  assert.deepEqual(categoryOrder,["people","organizations","businesses","opportunities","events"]);
});
test("each fixed row reveals in sequence and never moves horizontally", () => {
  const tops=[1000,1112,1224,1336,1448];
  for(let scroll=0;scroll<=1600;scroll++) {
    const frames=tops.map(top=>categoryRevealFrame(scroll,top,1000));
    frames.forEach((frame,i)=> {
      assert.ok(frame.opacity>=0 && frame.opacity<=1);
      assert.ok(frame.y>=0 && frame.y<=12);
      if(i>0) assert.ok(frame.opacity<=frames[i-1].opacity);
    });
    assert.ok(frames.filter(frame=>frame.opacity>0 && frame.opacity<1).length<=1);
  }
  assert.deepEqual(categoryRevealFrame(0,1000,1000),{opacity:0,y:12});
  assert.deepEqual(categoryRevealFrame(1000,1000,1000),{opacity:1,y:0});
});
test("pause and reverse depend only on scroll position", () => {
  const paused=categoryRevealFrame(150,1000,1000);
  categoryRevealFrame(1000,1000,1000);
  assert.deepEqual(categoryRevealFrame(150,1000,1000),paused);
  assert.ok(paused.opacity>0 && paused.opacity<1);
  assert.deepEqual(categoryRevealFrame(0,1000,1000),{opacity:0,y:12});
});
test("short viewport and responsive layout measurements stay bounded", () => {
  for(const height of [300,600,844,1000]) {
    for(const top of [500,600,700,800,900]) {
      const state=categoryRevealFrame(500,top,height);
      assert.ok(Number.isFinite(state.opacity) && Number.isFinite(state.y));
      assert.ok(state.opacity>=0 && state.opacity<=1);
    }
  }
});
