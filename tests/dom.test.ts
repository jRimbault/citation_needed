import { createNode, debounce } from "@/dom";

describe(createNode.name, () => {
  test("returns element with correct tag", () => {
    const el = createNode("div");
    expect(el.tagName.toLowerCase()).toBe("div");
  });

  test("applies attributes to node", () => {
    const el = createNode("a", {
      attributes: { href: "test-link", target: "_blank" },
    });
    expect(el.getAttribute("href")).toBe("test-link");
    expect(el.getAttribute("target")).toBe("_blank");
  });

  test("appends children to node", () => {
    const child = createNode("span");
    const el = createNode("div", { children: [child] });
    expect(el.firstChild?.nodeName.toLowerCase()).toBe("span");
  });

  test("applies id and classList to node", () => {
    const el = createNode("div", {
      id: "test-id",
      classList: ["class1", "class2"],
    });
    expect(el.id).toBe("test-id");
    expect(el.classList.contains("class1")).toBe(true);
    expect(el.classList.contains("class2")).toBe(true);
  });

  test("applies id and classList string to node", () => {
    const el = createNode("div", {
      id: "test-id",
      classList: "direct-class",
    });
    expect(el.id).toBe("test-id");
    expect(el.classList.contains("direct-class")).toBe(true);
  });

  test("sets textContent on node", () => {
    const el = createNode("p", { textContent: "Hello, world!" });
    expect(el.textContent).toBe("Hello, world!");
  });

  test("sets innerHTML on node", () => {
    const el = createNode("div", {
      textContent: { html: "<span>Test</span>" },
    });
    expect(el.innerHTML).toBe("<span>Test</span>");
  });

  test("adds event listeners to node", () => {
    let clicked = false;
    const el = createNode("button", {
      listeners: {
        click: () => {
          clicked = true;
        },
      },
    });
    el.click();
    expect(clicked).toBe(true);
  });

  test("adds multiple event listeners to node", () => {
    const events = {
      clicked: false,
      mouseovered: false,
    };
    const el = createNode("button", {
      listeners: {
        click: [
          () => {
            events.clicked = true;
          },
          true,
        ],
        mouseover: () => {
          events.mouseovered = true;
        },
      },
    });
    el.click();
    expect(events.clicked).toBe(true);
    el.dispatchEvent(new Event("mouseover"));
    expect(events.mouseovered).toBe(true);
  });

  test("handles nested children correctly", () => {
    const child1 = createNode("span", { textContent: "Child 1" });
    const child2 = createNode("span", { textContent: "Child 2" });
    const parent = createNode("div", { children: [child1, child2] });
    expect(parent.children.length).toBe(2);
    expect(parent.children[0].textContent).toBe("Child 1");
    expect(parent.children[1].textContent).toBe("Child 2");
  });

  test("handles empty options gracefully", () => {
    const el = createNode("div", {});
    expect(el.tagName.toLowerCase()).toBe("div");
  });

  test("handles undefined options gracefully", () => {
    const el = createNode("div");
    expect(el.tagName.toLowerCase()).toBe("div");
  });

  test("handles NodeDefinition tuple children", () => {
    const parent = createNode("div", {
      children: [
        ["span", { textContent: "First" }],
        ["span", { textContent: "Second" }],
      ],
    });
    expect(parent.children.length).toBe(2);
    expect(parent.children[0].textContent).toBe("First");
    expect(parent.children[1].textContent).toBe("Second");
  });

  test("handles mixed Node and NodeDefinition children", () => {
    const directChild = createNode("span", { textContent: "Direct" });
    const parent = createNode("div", {
      children: [directChild, ["span", { textContent: "Tuple" }]],
    });
    expect(parent.children.length).toBe(2);
    expect(parent.children[0].textContent).toBe("Direct");
    expect(parent.children[1].textContent).toBe("Tuple");
  });

  test("escapes textContent to prevent XSS", () => {
    const el = createNode("div", {
      textContent: '<script>alert("xss")</script>',
    });
    // textContent should escape HTML
    expect(el.textContent).toBe('<script>alert("xss")</script>');
    expect(el.innerHTML).toBe("&lt;script&gt;alert(\"xss\")&lt;/script&gt;");
  });

  test("filters out falsy values from classList array", () => {
    const el = createNode("div", {
      classList: ["class1", "", "class2", null as any, "class3"],
    });
    expect(el.classList.contains("class1")).toBe(true);
    expect(el.classList.contains("class2")).toBe(true);
    expect(el.classList.contains("class3")).toBe(true);
    expect(el.classList.length).toBe(3);
  });

  test("handles empty classList string", () => {
    const el = createNode("div", {
      classList: "",
    });
    expect(el.classList.length).toBe(0);
  });
});

describe(debounce.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should only be called once in a series of call", async () => {
    const mock = vi.fn();
    const eventHandler1 = debounce(() => mock(), 100);
    eventHandler1(new Event("click"));
    eventHandler1(new Event("click"));
    eventHandler1(new Event("click"));
    eventHandler1(new Event("click"));
    vi.advanceTimersByTime(1000);
    expect(mock).toHaveBeenCalledTimes(1);
    const eventHandler2 = debounce(() => mock());
    eventHandler2(new Event("click"));
    eventHandler2(new Event("click"));
    eventHandler2(new Event("click"));
    eventHandler2(new Event("click"));
    vi.advanceTimersByTime(1000);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  test("should debounce with default timeout", async () => {
    const mock = vi.fn();
    const eventHandler = debounce(() => mock());
    eventHandler(new Event("input"));
    vi.advanceTimersByTime(400);
    expect(mock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  test("should reset timer on each call", async () => {
    const mock = vi.fn();
    const eventHandler = debounce(() => mock(), 100);
    eventHandler(new Event("input"));
    vi.advanceTimersByTime(50);
    eventHandler(new Event("input"));
    vi.advanceTimersByTime(50);
    expect(mock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  test("should pass event to handler", async () => {
    const mock = vi.fn();
    const eventHandler = debounce((event: Event) => mock(event.type), 100);
    const testEvent = new Event("test-event");
    eventHandler(testEvent);
    vi.advanceTimersByTime(100);
    expect(mock).toHaveBeenCalledWith("test-event");
  });
});
