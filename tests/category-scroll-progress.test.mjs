import assert from "node:assert/strict";
import test from "node:test";
import { categoryFrame, categoryInteractionFrame, categoryLineScale, categoryOrder } from "../src/components/public/category-scroll-progress.ts";

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

test("five categories preserve order, start horizontally, and finish evenly spaced", () => {
  assert.deepEqual(categoryOrder, ["people", "organizations", "businesses", "opportunities", "events"]);
  for (const width of [852, 900, 960]) {
    const initial = categoryOrder.map((_, i) => categoryFrame(0, i, width));
    const final = categoryOrder.map((_, i) => categoryFrame(1, i, width));
    assert.ok(initial.slice(1).every((item, i) => item.x < initial[i].x), "People begins rightmost; subsequent icons follow from right to left");
    assert.ok(initial.every(item => item.y === 0 && item.opacity === 0));
    assert.ok(final.every(item => item.x === 32 && item.opacity === 1 && item.textX === 0));
    final.forEach((item, i) => assert.equal(item.y, 144 + 80 * i));
    initial.forEach(item => assert.ok(item.x >= 0 && item.x + 64 <= width));
  }
});

test("L-shaped travel stays in bounds and never intersects visible descriptions", () => {
  for (const width of [852, 900, 960]) {
    for (let sample = 0; sample <= 2000; sample++) {
      const progress = sample / 2000;
      const frames = categoryOrder.map((_, i) => categoryFrame(progress, i, width));
      frames.forEach((frame, i) => {
        const icon = { ...frame, w: 64, h: 64 };
        assert.ok(frame.x >= 0 && frame.x + 64 <= width);
        frames.forEach((other, j) => {
          if (other.opacity > 0) assert.equal(overlap(icon, { x: 232 + other.textX, y: 144 + j * 80, w: width - 248, h: 64 }), false, `copy ${j} at ${progress}`);
        });
        if (frame.opacity > 0) { assert.equal(frame.x, 32); assert.equal(frame.y, 144 + i * 80); }
      });
    }
  }
});

test("pause and reverse are deterministic; later icons stay in their original row", () => {
  for (let i = 0; i < 5; i++) {
    const before = 0.04 + i * 0.17;
    assert.deepEqual(categoryFrame(before - 0.001, i, 960), categoryFrame(0, i, 960));
    const progress = before + 0.08;
    const paused = categoryFrame(progress, i, 960);
    categoryFrame(1, i, 960);
    assert.deepEqual(categoryFrame(progress, i, 960), paused);
    assert.deepEqual(categoryFrame(0, i, 960), categoryFrame(-1, i, 960));
  }
  assert.equal(categoryLineScale(1), 1);
  assert.ok(categoryLineScale(0) > 0);
  for (let p = 0; p < 1; p += 0.01) assert.ok(categoryLineScale(p) <= categoryLineScale(p + 0.01));
});


test("movement is strictly horizontal first and vertical second, continuous at the corner", () => {
  for (let index = 0; index < 5; index++) {
    const start = 0.04 + index * 0.17;
    const corner = start + 0.13 * 0.55;
    const horizontal = categoryFrame(start + 0.13 * 0.25, index, 960);
    const vertical = categoryFrame(start + 0.13 * 0.75, index, 960);
    assert.equal(horizontal.y, 0);
    assert.equal(vertical.x, 32);
    assert.ok(vertical.y > 0 && vertical.y < 144 + index * 80);
    const before = categoryFrame(corner - 1e-7, index, 960);
    const after = categoryFrame(corner + 1e-7, index, 960);
    assert.ok(Math.abs(before.x - after.x) < 1e-6);
    assert.ok(Math.abs(before.y - after.y) < 1e-6);
    for(let step = 0; step < 100; step++) {
      const state=categoryFrame(start+step/100*0.13,index,960);
      assert.ok(state.y===0 || state.x===32,"No diagonal or intermediate-lane movement");
    }
  }
});

test("crossings have exactly one pointer target without changing the L-shaped geometry", () => {
  for (const width of [852, 900, 960]) {
    for(let sample=0;sample<=2000;sample++) {
      const progress=sample/2000;
      const state=categoryInteractionFrame(progress,width);
      assert.deepEqual(state.frames,categoryOrder.map((_,i)=>categoryFrame(progress,i,width)));
      if(state.movingIndex>=0) assert.equal(state.interactive[state.movingIndex],true);
      state.frames.forEach((a,i)=>state.frames.forEach((b,j)=> {
        if(i!==j && state.interactive[i] && state.interactive[j])
          assert.equal(overlap({...a,w:64,h:64},{...b,w:64,h:64}),false,`ambiguous targets ${i}/${j} at ${progress}`);
      }));
    }
  }
  assert.ok(categoryInteractionFrame(0,960).interactive.every(Boolean));
  assert.ok(categoryInteractionFrame(1,960).interactive.every(Boolean));
});
