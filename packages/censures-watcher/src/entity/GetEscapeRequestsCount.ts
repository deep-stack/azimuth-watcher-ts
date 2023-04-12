//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockHash', 'contractAddress', '_sponsor'], { unique: true })
export class GetEscapeRequestsCount {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar', { length: 42 })
    contractAddress!: string;

  @Column('integer')
    _sponsor!: number;

  @Column('numeric', { transformer: bigintTransformer })
    value!: bigint;

  @Column('text', { nullable: true })
    proof!: string;
}
