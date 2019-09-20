import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { TestTypeOrmModule } from './utils/testTypeOrmModule'
import { UserModule } from '../../exampleApp/src/user/user.module'
import { TestAuthModule } from '../../exampleApp/test/testAuth/testAuth.module'
import { AdminCoreModuleFactory } from '../adminCore.module'
import { JSDOM } from 'jsdom'
import DefaultAdminModule from '../defaultAdmin.module'
import { Agency } from '../../exampleApp/src/user/agency.entity'
import { User } from '../../exampleApp/src/user/user.entity'

describe('changelist', () => {
  let app: INestApplication
  let document: Document

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestTypeOrmModule.forRoot({ entities: [User, Agency] }),
        UserModule,
        TestAuthModule,
        AdminCoreModuleFactory.createAdminCoreModule({}),
      ],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    const dom = new JSDOM()
    document = dom.window.document
  })

  it('can show the columns defined in listDisplay', async () => {
    const server = app.getHttpServer()
    const res = await request(server).get(`/admin/user/user`)

    expect(res.status).toBe(200)

    document.documentElement.innerHTML = res.text
    expect(document.querySelector('table th:nth-child(1)').innerHTML.includes('User')).toBeTruthy()
    expect(document.querySelector('table th:nth-child(2)').innerHTML.includes('email')).toBeTruthy()
    expect(
      document.querySelector('table th:nth-child(3)').innerHTML.includes('description'),
    ).toBeTruthy()
  })

  it('does not show a table when listDisplay is not defined', async () => {
    const server = app.getHttpServer()
    const res = await request(server).get(`/admin/agency/agency`)

    expect(res.status).toBe(200)

    document.documentElement.innerHTML = res.text
    expect(document.querySelector('table > thead')).toBeFalsy()
  })
})
