
export class Resource {
  public id: number;
  public name: string;
  public amount: number;
  public perSec: number;
  public perAction: number;
  public maxAmount: number;
  public active: boolean;

  constructor(id: number, name: string, amount: number, maxAmount: number) {
    this.id = id;
    this.name = name;
    this.amount = amount;
    this.maxAmount = maxAmount;

    this.perSec = 0;
    this.perAction = 1;
    this.active = false;
  }
  /**
   * Update this resource
   * @param deltaT Time in seconds since last update
   */
  update(deltaT: number) {
    if (this.amount < this.maxAmount) {
      this.amount += this.perSec * deltaT
      if (this.active) this.amount += this.perAction * deltaT
      if (this.amount > this.maxAmount) this.amount = this.maxAmount
    }
  }

}

/**
 * Test desc.
 */
export const resources = [
  new Resource(1, 'bones', 0, 50),
  new Resource(2, 'essence', 0, 10),
  new Resource(3, 'wood', 0, 100),
  new Resource(4, 'stones', 0, 100)
]
//Maybe in future, store resources as a JSON file and directly parse it in SaveData() 