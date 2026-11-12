import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SelectInput } from "@/components/ui/select-input";

describe("SelectInput component", () => {
  it("renders selected value when value is a string", () => {
    render(
      <SelectInput
        datalist={[
          { label: "Option A", value: "a" },
          { label: "Option B", value: "b" },
        ]}
        value="a"
      />
    );

    expect(screen.getByText("Option A")).toBeDefined();
  });

  it("calls onChange with selected value string when user selects an option", async () => {
    const handleChange = vi.fn();

    render(
      <SelectInput
        datalist={[
          { label: "Option A", value: "a" },
          { label: "Option B", value: "b" },
        ]}
        value="a"
        onChange={handleChange}
      />
    );

    const control = screen.getByText("Option A");
    fireEvent.keyDown(control, { key: "ArrowDown" });

    const optionB = await screen.findByText("Option B");
    fireEvent.click(optionB);

    expect(handleChange).toHaveBeenCalledWith("b");
  });

  it("renders custom optionLabel if provided", () => {
    render(
      <SelectInput
        datalist={[
          {
            label: "All Areas",
            value: "all",
            optionLabel: <span data-testid="custom-label">Custom All Areas</span>,
          },
        ]}
        value="all"
      />
    );

    expect(screen.getByTestId("custom-label")).toBeDefined();
  });

  it("renders placeholder when value is empty or not selected", () => {
    render(
      <SelectInput
        placeholder="Choose something"
        datalist={[{ label: "Option A", value: "a" }]}
        value=""
      />
    );

    expect(screen.getByText("Choose something")).toBeDefined();
  });
});
