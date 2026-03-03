import type { LayoutDirection } from "@luseefor/synthex-core";
import type { Command } from "commander";
import { createCliLayoutEngine } from "../engine/layoutEngine";
import { CliError } from "../utils/errors";
import { logger } from "../utils/logger";

export function registerLayoutCommands(program: Command): void {
  program
    .command("layout:create")
    .description("Create or overwrite layout.json with the default layout.")
    .action(async () => {
      const layoutEngine = await createCliLayoutEngine({ allowMissingLayout: true });
      const layout = layoutEngine.createDefaultLayout();
      await layoutEngine.replaceLayout(layout, "layout:create");

      logger.success("Created default layout.");
    });

  program
    .command("layout:add-panel")
    .description("Add a panel to the primary tab host.")
    .argument("<panelId>", "Panel identifier")
    .action(async (panelId: string) => {
      const layoutEngine = await createCliLayoutEngine();
      await layoutEngine.addPanel(panelId);

      logger.success(`Added panel "${panelId}".`);
    });

  program
    .command("layout:split")
    .description("Split a target node and insert a generated panel.")
    .argument("<nodeId>", "Target node identifier")
    .argument("<direction>", "Split direction: horizontal | vertical")
    .action(async (nodeId: string, directionInput: string) => {
      const direction = parseDirection(directionInput);
      const layoutEngine = await createCliLayoutEngine();
      await layoutEngine.splitNode(nodeId, direction);

      logger.success(`Split node "${nodeId}" ${direction}.`);
    });

  program
    .command("layout:print")
    .description("Print the current layout JSON.")
    .action(async () => {
      const layoutEngine = await createCliLayoutEngine();

      process.stdout.write(`${layoutEngine.print()}\n`);
    });
}

function parseDirection(direction: string): LayoutDirection {
  if (direction === "horizontal" || direction === "vertical") {
    return direction;
  }

  throw new CliError(`Invalid direction "${direction}". Expected "horizontal" or "vertical".`);
}
