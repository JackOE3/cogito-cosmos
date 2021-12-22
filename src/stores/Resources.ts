
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

    this.perSec = 0;
    this.perAction = 1;
  }
  /**
   * Update this resource
   * @param deltaT Time in seconds since last update
   */
  update(deltaT: number) {
    if (this.amount < this.maxAmount) {
      this.amount += this.perSec * deltaT
      if (this.amount > this.maxAmount) this.amount = this.maxAmount
    }
  }

}

/**
 * Test desc.
 */
export const resources = [
  new Resource(ResourceType.BONES, 'bones', 0, 50),
  new Resource(ResourceType.ESSENCE, 'essence', 0, 10),
  new Resource(ResourceType.WOOD, 'wood', 0, 100),
  new Resource(ResourceType.STONES, 'stones', 0, 100)
]
//Maybe in future, store resources as a JSON file and directly parse it in SaveData() 