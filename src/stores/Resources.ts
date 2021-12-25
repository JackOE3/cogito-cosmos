/**
 * The different types of resources.
 */
export enum ResourceType {
  BONES,
  ESSENCE,
  WOOD,
  STONES
}

/**
 * The resource object.
 */
export class Resource {
  public resourceType: ResourceType;
  public name: string;
  public amount: number;
  public perSec: number;
  public perAction: number;
  public maxAmount: number;
  public active: boolean;

  constructor(resourceType: ResourceType, name: string, amount: number, maxAmount: number) {
    this.resourceType = resourceType;
    this.name = name;
    this.amount = amount;
    this.maxAmount = maxAmount;

    this.perSec = 0.5;
    this.perAction = 1;
  }
}
