import Entity from '../src/entity'
import World from '../src/world'

class Component1 {
  constructor(value) {
    this.value = value
  }
}

class Component2 {
  constructor(value) {
    this.value = value
  }
}

describe('Entity Test', () => {
  it('Entity id', () => {
    const entities = []

    for (let i = 0; i < 10; i ++) {
      entities.push(new Entity())
    }
    for (let i = 0; i < 10; i ++) {
      expect(entities[i]._id).toEqual(i)
    }
  })

  it('AddToWorld', () => {
    const world = new World()
    const entity = new Entity()
    const cb = jest.fn()
    entity._entityAddToWorldCb.push(cb)
    entity.addToWorld(world)
    expect(entity._world).toEqual(world)
    expect(cb).toHaveBeenCalled()
  })

  it('removeFromWorld', () => {
    const world = new World()
    const entity = new Entity()
    const cb = jest.fn()
    entity._entityRemoveFromWorldCb.push(cb)
    entity.addToWorld(world)
    entity.removeFromWorld()
    expect(entity._world).toBeUndefined()
    expect(cb).toHaveBeenCalled()
  })

  it('getWorld', () => {
    const world = new World()
    const entity = new Entity()
    entity.addToWorld(world)
    expect(entity.world).toEqual(world)
  })

  it('insertAddToWorldCb', () => {
    const world = new World()
    const entity = new Entity()
    const cb1 = jest.fn()
    const cb2 = jest.fn()
    const returnEntity = entity.insertAddToWorldCb(cb1)
    entity.insertAddToWorldCb(cb2)
    entity.addToWorld(world)

    expect(returnEntity).toEqual(entity)
    expect(cb1).toHaveBeenCalled()
    expect(cb2).toHaveBeenCalled()
  })

  it('insertRemoveFromWorldCb', () => {
    const entity = new Entity()
    const cb1 = jest.fn()
    const cb2 = jest.fn()
    const returnEntity = entity.insertAddToWorldCb(cb1)
    expect(entity._entityAddToWorldCb.length).toEqual(1)
    entity.insertAddToWorldCb(cb2)
    expect(entity._entityAddToWorldCb.length).toEqual(2)

    expect(returnEntity.id).toEqual(entity.id)
  })

  it('deleteAddToWorldCb', () => {
    const entity = new Entity()
    const cb1 = jest.fn()
    const cb2 = jest.fn()
    entity.insertAddToWorldCb(cb1)
    entity.insertAddToWorldCb(cb2)
    expect(entity._entityAddToWorldCb.length).toEqual(2)
    const returnEntity = entity.deleteAddToWorldCb(cb1)
    expect(entity._entityAddToWorldCb.length).toEqual(1)
    expect(entity._entityAddToWorldCb[0]).toEqual(cb2)

    expect(returnEntity.id).toEqual(entity.id)
  })

  it('deleteRemoveFromWorldCb', () => {
    const entity = new Entity()
    const cb1 = jest.fn()
    const cb2 = jest.fn()
    entity.insertRemoveFromWorldCb(cb1)
    entity.insertRemoveFromWorldCb(cb2)
    expect(entity._entityRemoveFromWorldCb.length).toEqual(2)
    const returnEntity = entity.deleteRemoveFromWorldCb(cb1)
    expect(entity._entityRemoveFromWorldCb.length).toEqual(1)
    expect(entity._entityRemoveFromWorldCb[0]).toEqual(cb2)

    expect(returnEntity.id).toEqual(entity.id)
  })

  it('addComponent with tag', () => {
    const entity = new Entity()
    entity.addComponent('oneTag')
    entity.addComponent('tag2')
    entity.addComponent('tag3')
    expect(entity.oneTag).toBeTruthy()
    expect(entity.tag2).toBeTruthy()
    expect(entity.tag3).toBeTruthy()
    expect(entity.otherTag).toBeUndefined()
  })

  it('addComponent with keyValue', () => {
    const entity = new Entity()
    entity.addComponent('name', 'test')
    entity.addComponent('speed', 123)
    expect(entity.name).toEqual('test')
    expect(entity.speed).toEqual(123)
  })

  it('addComponent: inner function', () => {
    const world = new World()
    const entity = new Entity()
    entity._addComponentLifeCycle = jest.fn()
    entity._removeComponentLifeCycle = jest.fn()
    world.addEntityToTuples = jest.fn()
    entity._world = world
    // add first component(tag)
    entity.addComponent('tag')
    expect(entity._addComponentLifeCycle).toHaveBeenCalledTimes(1)
    expect(entity._removeComponentLifeCycle).toHaveBeenCalledTimes(0)
    expect(world.addEntityToTuples).toHaveBeenCalledTimes(1)

    entity.addComponent('tag')
    expect(entity._addComponentLifeCycle).toHaveBeenCalledTimes(2)
    expect(entity._removeComponentLifeCycle).toHaveBeenCalledTimes(1)
    expect(world.addEntityToTuples).toHaveBeenCalledTimes(1)
  })

  it('removeComponent', () => {
    const entity = new Entity()
    // add four components
    entity.addComponent(Component1)
    entity.addComponent(new Component2('test2'))
    entity.addComponent('tag')
    entity.addComponent('key', 'value')
    // remove four components
    entity.removeComponent('component1')
    entity.removeComponent('component2')
    entity.removeComponent('tag')
    entity.removeComponent('key')
    // check componnets
    expect(entity.component1).toBeUndefined()
    expect(entity.component2).toBeUndefined()
    expect(entity.tag).toBeUndefined()
    expect(entity.key).toBeUndefined()
  })

  it('removeComponent: inner function', () => {
    const world = new World()
    const entity = new Entity()
    entity._removeComponentLifeCycle = jest.fn()
    world.removeEntityFromTuples = jest.fn()

    // add components
    const component1 = Component1
    const component2 = new Component2('test')
    entity.removeComponent('tag')
    expect(entity._removeComponentLifeCycle).toHaveBeenCalledTimes(0)
    expect(world.removeEntityFromTuples).toHaveBeenCalledTimes(0)

    entity.addComponent('tag')
    entity.removeComponent('tag')
    expect(entity._removeComponentLifeCycle).toHaveBeenCalledTimes(1)
    expect(entity._removeComponentLifeCycle).toHaveBeenCalledWith(true)
    expect(world.removeEntityFromTuples).toHaveBeenCalledTimes(0)

    entity._world = world
    entity.addComponent('tag')
    entity.removeComponent('tag')
    expect(entity._removeComponentLifeCycle).toHaveBeenCalledTimes(2)
    expect(entity._removeComponentLifeCycle).toHaveBeenCalledWith(true)
    expect(world.removeEntityFromTuples).toHaveBeenCalledTimes(1)
    expect(world.removeEntityFromTuples).toHaveBeenCalledWith(entity)
  })

  it('has', () => {
    const entity = new Entity()
    entity.addComponent('oneTag')
    entity.addComponent('tag2')
    entity.addComponent('tag3')
    expect(entity.has('oneTag', 'tag2')).toBeTruthy()
    expect(entity.has('oneTag', 'tag2', 'tag3')).toBeTruthy()
    expect(entity.has('otherTag')).toBeFalsy()
  })

  it('_addComponentLifeCycle', () => {
    const entity = new Entity()
    const component = new Component1('value')
    component.addToEntityCb = jest.fn()
    component.entityAddToWorldCb = jest.fn()
    component.entityRemoveFromWorldCb = jest.fn()

    entity._addComponentLifeCycle(component)

    expect(component.addToEntityCb).toHaveBeenCalledWith(entity)
    expect(entity._entityAddToWorldCb.length).toEqual(1)
    expect(entity._entityRemoveFromWorldCb.length).toEqual(1)
  })

  it('_removeComponentLifeCycle', () => {
    const entity = new Entity()
    const component = new Component1('value')
    component.removeFromEntityCb = jest.fn()
    component.entityAddToWorldCb = jest.fn()
    component.entityRemoveFromWorldCb = jest.fn()

    entity._addComponentLifeCycle(component)
    expect(entity._entityAddToWorldCb.length).toEqual(1)
    expect(entity._entityRemoveFromWorldCb.length).toEqual(1)

    entity._removeComponentLifeCycle(component)
    expect(component.removeFromEntityCb).toHaveBeenCalledWith(entity)
    expect(entity._entityAddToWorldCb.length).toEqual(0)
    expect(entity._entityRemoveFromWorldCb.length).toEqual(0)
  })

  it('destroy', () => {
    const entity = new Entity()
    entity.destroy()

    const world = new World()
    world.addEntity(entity)
    world.removeEntity = jest.fn()
    entity.destroy()
    expect(world.removeEntity).toHaveBeenCalledWith(entity)
  })
})
